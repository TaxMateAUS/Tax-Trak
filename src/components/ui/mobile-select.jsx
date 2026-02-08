import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function MobileSelect({ value, onValueChange, children, placeholder, trigger }) {
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const options = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type.name === 'SelectItem'
  );

  const selectedOption = options.find(
    option => React.isValidElement(option) && option.props.value === value
  );

  const displayValue = selectedOption 
    ? React.isValidElement(selectedOption) ? selectedOption.props.children : placeholder
    : placeholder;

  if (!isMobile) {
    return trigger;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-between"
      >
        {displayValue}
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="safe-bottom">
          <DrawerHeader>
            <DrawerTitle>{placeholder || 'Select option'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1 max-h-[60vh] overflow-y-auto">
            {options.map((option, index) => {
              if (!React.isValidElement(option)) return null;
              const optionValue = option.props.value;
              const isSelected = value === optionValue;
              return (
                <button
                  key={index}
                  onClick={() => {
                    onValueChange(optionValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                    isSelected 
                      ? "bg-slate-900 dark:bg-slate-700 text-white" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span>{option.props.children}</span>
                  {isSelected && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}