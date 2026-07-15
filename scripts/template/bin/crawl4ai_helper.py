"""
crawl4ai_helper.py — Wrapper around AsyncWebCrawler for the Munro agent.

Lives at /root/.hermes/bin/crawl4ai-helper.py on every customer box.
The agent imports it to fetch URLs as clean markdown.

Usage from the agent:

    from crawl4ai_helper import fetch_markdown, fetch_many

    md = fetch_markdown("https://example.com")
    results = fetch_many(["https://a.com", "https://b.com"])

Design choices:
- Stealth mode is on by default (Cloudflare / DataDome handling)
- JS execution enabled with a 2s settle delay
- Cookie banners and popups auto-removed
- Returns clean markdown — never raw HTML
- Failures raise FetchError (the agent should retry, not silently swallow)
- Parallel fetching via arun_many for efficiency
"""

import asyncio
import logging
from typing import Any

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

log = logging.getLogger("crawl4ai-helper")

# Default browser config — used for every fetch unless overridden
DEFAULT_BROWSER = BrowserConfig(
    browser_type="chromium",
    headless=True,
    enable_stealth=True,  # Critical for protected sites
)

# Default crawl config — overridable per-call
DEFAULT_CRAWL_KWARGS = {
    "page_timeout": 20000,
    "delay_before_return_html": 2.0,
    "remove_overlay_elements": True,  # kill cookie banners
    "magic": True,  # auto-handle common anti-bot patterns
}


class FetchError(RuntimeError):
    """Raised when a URL fetch fails for any reason."""


async def _fetch_one(url: str, overrides: dict[str, Any] | None = None) -> str:
    """Internal: fetch a single URL and return markdown."""
    kwargs = {**DEFAULT_CRAWL_KWARGS, **(overrides or {})}
    config = CrawlerRunConfig(**kwargs)
    async with AsyncWebCrawler(config=DEFAULT_BROWSER) as crawler:
        result = await crawler.arun(url=url, config=config)
        if not result.success:
            raise FetchError(
                f"Failed to fetch {url}: {result.error_message or 'unknown error'}"
            )
        return result.markdown


async def fetch_markdown(url: str, **overrides) -> str:
    """
    Fetch a URL and return clean markdown.

    Args:
        url: The URL to fetch.
        **overrides: Any CrawlerRunConfig field to override (page_timeout, etc.)

    Returns:
        Clean markdown string.

    Raises:
        FetchError: If the fetch fails.
    """
    try:
        return await _fetch_one(url, overrides)
    except Exception as e:
        log.error("fetch_markdown failed for %s: %s", url, e)
        raise FetchError(str(e)) from e


async def _fetch_many(urls: list[str], overrides: dict[str, Any] | None = None) -> list[dict]:
    """Internal: fetch multiple URLs in parallel."""
    kwargs = {**DEFAULT_CRAWL_KWARGS, **(overrides or {})}
    config = CrawlerRunConfig(**kwargs)
    async with AsyncWebCrawler(config=DEFAULT_BROWSER) as crawler:
        # arun_many returns either a list (batch mode) or an async generator
        # (stream mode). Await to resolve the union, then handle both shapes.
        result_or_gen = await crawler.arun_many(urls=urls, config=config)
        if hasattr(result_or_gen, "__aiter__"):
            # Streaming — collect from async generator
            results = []
            async for r in result_or_gen:
                results.append(r)
        else:
            # Batch — list of CrawlResult objects
            results = list(result_or_gen)  # type: ignore[arg-type]
        return [
            {
                "url": r.url,
                "markdown": r.markdown if r.success else "",
                "success": r.success,
                "error": r.error_message if not r.success else None,
            }
            for r in results
        ]


async def fetch_many(urls: list[str], **overrides) -> list[dict]:
    """
    Fetch multiple URLs in parallel.

    Args:
        urls: List of URLs to fetch.
        **overrides: Any CrawlerRunConfig field to override.

    Returns:
        List of dicts with keys: url, markdown, success, error.
        Failures don't raise — check the 'success' field.
    """
    return await _fetch_many(urls, overrides)


# ─── Synchronous wrappers ─────────────────────────────────────────────
# The agent often runs sync code. These wrap the async helpers
# so the agent can call fetch_sync() without an event loop.

def _run_async(coro):
    """Run an async coroutine, handling the case where an event loop is already running."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # We're inside an async context. Spin up a new loop in a thread.
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                return ex.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        # No event loop — safe to use asyncio.run()
        return asyncio.run(coro)


def fetch_sync(url: str, **overrides) -> str:
    """Synchronous wrapper around fetch_markdown."""
    return _run_async(fetch_markdown(url, **overrides))


def fetch_many_sync(urls: list[str], **overrides) -> list[dict]:
    """Synchronous wrapper around fetch_many."""
    return _run_async(fetch_many(urls, **overrides))


# ─── Structured extraction ────────────────────────────────────────────
# For "pull the price / team size / contact form from this page" use cases.

async def extract_structured(
    url: str,
    schema: dict,
    **overrides,
) -> dict:
    """
    Fetch a URL and extract structured fields matching the given schema.

    Args:
        url: The URL to fetch.
        schema: A JSON schema describing fields to extract.
        **overrides: Any CrawlerRunConfig field to override.

    Returns:
        Dict of extracted fields.
    """
    # crawl4ai's extraction API takes a schema and returns matching JSON
    from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

    kwargs = {
        **DEFAULT_CRAWL_KWARGS,
        "extraction_strategy": JsonCssExtractionStrategy(schema=schema),
        **(overrides or {}),
    }
    config = CrawlerRunConfig(**kwargs)
    async with AsyncWebCrawler(config=DEFAULT_BROWSER) as crawler:
        result = await crawler.arun(url=url, config=config)
        if not result.success:
            raise FetchError(f"Failed to fetch {url}: {result.error_message}")
        # result.extracted_content is the JSON-LD-style structured data
        import json
        try:
            return json.loads(result.extracted_content)
        except (json.JSONDecodeError, TypeError):
            return {}


def extract_structured_sync(url: str, schema: dict, **overrides) -> dict:
    """Synchronous wrapper around extract_structured."""
    return _run_async(extract_structured(url, schema, **overrides))


__all__ = [
    "fetch_markdown",
    "fetch_many",
    "fetch_sync",
    "fetch_many_sync",
    "extract_structured",
    "extract_structured_sync",
    "FetchError",
]