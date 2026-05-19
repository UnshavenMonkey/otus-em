import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ButtonVariants = {
  Default: "default",
  Outline: "outline",
  Secondary: "secondary",
  Ghost: "ghost",
  Destructive: "destructive",
  Link: "link",
} as const

const ButtonSizes = {
  Default: "default",
  Xs: "xs",
  Sm: "sm",
  Lg: "lg",
  Icon: "icon",
  IconXs: "icon-xs",
  IconSm: "icon-sm",
  IconLg: "icon-lg",
} as const

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        [ButtonVariants.Default]: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        [ButtonVariants.Outline]:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        [ButtonVariants.Secondary]:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        [ButtonVariants.Ghost]:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        [ButtonVariants.Destructive]:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        [ButtonVariants.Link]: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        [ButtonSizes.Default]:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        [ButtonSizes.Xs]: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        [ButtonSizes.Sm]: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        [ButtonSizes.Lg]: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        [ButtonSizes.Icon]: "size-8",
        [ButtonSizes.IconXs]:
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        [ButtonSizes.IconSm]:
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        [ButtonSizes.IconLg]: "size-9",
      },
    },
    defaultVariants: {
      variant: ButtonVariants.Default,
      size: ButtonSizes.Default,
    },
  }
)

function Button({
  className,
  variant = ButtonVariants.Default,
  size = ButtonSizes.Default,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, ButtonSizes, ButtonVariants, buttonVariants }
