import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Mail,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileDropdownProps {
  className?: string;
}

export default function ProfileDropdown({ className = "" }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleProfile = () => {
    // Navigate to profile page or open profile modal
    console.log('Navigate to profile');
    setIsOpen(false);
  };

  // Get user initials from user name or email
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-10 rounded-full hover:bg-background/50 ${className}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 bg-background rounded-full p-0.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-chatgpt-card border-border shadow-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {getUserDisplayName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getUserEmail()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={handleProfile}
          className="cursor-pointer hover:bg-background/50 focus:bg-background/50"
        >
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">View Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSettings}
          className="cursor-pointer hover:bg-background/50 focus:bg-background/50"
        >
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={() => {
            console.log('Help & Support');
            setIsOpen(false);
          }}
          className="cursor-pointer hover:bg-background/50 focus:bg-background/50"
        >
          <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
