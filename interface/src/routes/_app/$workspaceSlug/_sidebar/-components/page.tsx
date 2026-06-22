import { useAtomValue } from "@effect/atom-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@recount/ui/breadcrumb";
import { cn } from "@recount/ui/utils";
import { Link } from "@tanstack/react-router";
import type {
  LinkProps,
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";
import { Fragment } from "react";

import { isNavigationSidebarOpenAtom } from "~/atoms/ui-atoms";

interface PageProps extends React.ComponentProps<"div"> {}
export function Page({ children, className, ...props }: PageProps) {
  return (
    <div
      className={cn("grid h-full w-full grid-cols-[minmax(0,1fr)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageMainProps extends React.ComponentProps<"div"> {}
export function PageMain({ children, className, ...props }: PageMainProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageContainerProps extends React.ComponentProps<"div"> {}
export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("max-w-[80ch] mx-auto w-full mt-16 mb-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageTopBarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function PageTopBar({ left, right }: PageTopBarProps) {
  const isNavigationSidebarOpen = useAtomValue(isNavigationSidebarOpenAtom);

  return (
    <header
      className={cn(
        "flex flex-row items-center justify-between py-2 px-4",
        !isNavigationSidebarOpen && "pl-12"
      )}
    >
      <div className="flex items-center grow gap-1">{left}</div>
      <div className="flex items-center gap-1">{right}</div>
    </header>
  );
}

interface PageTopBarBreadcrumbItem {
  label: string;
  linkOptions: LinkProps;
}

interface PageTopBarBreadcrumbBuilder<
  TRouter extends RegisteredRouter = RegisteredRouter,
> {
  push: <TOptions>(item: {
    label: string;
    linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  }) => void;
}

interface PageTopBarBreadcrumbsProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
> {
  items: (breadcrumbs: PageTopBarBreadcrumbBuilder<TRouter>) => void;
}

export function PageTopBarBreadcrumbs<
  TRouter extends RegisteredRouter = RegisteredRouter,
>({ items: buildItems }: PageTopBarBreadcrumbsProps<TRouter>) {
  const items: Array<PageTopBarBreadcrumbItem> = [];

  buildItems({
    push: (item) => {
      items.push(item as PageTopBarBreadcrumbItem);
    },
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link {...item.linkOptions}>{item.label}</Link>}
                  />
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
