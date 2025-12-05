'use client';

import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  const handleLanguageChange = async (language: LanguageCode) => {
    setCurrentLanguage(language);
    // Store preference in cookie/localStorage
    document.cookie = `language=${language}; path=/; max-age=31536000`;
    // Reload page to apply new language
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="flex items-center justify-between w-full">
              <span>{language.nativeName}</span>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
