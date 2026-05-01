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
import {
  Link,
  type RegisteredRouter,
  type ValidateLinkOptions,
} from "@tanstack/react-router";
import { Fragment, type PropsWithChildren } from "react";

import { isNavigationSidebarOpenAtom } from "~/atoms/ui-atoms";

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

interface PageTopBarBreadcrumbsProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  items: Array<{
    label: string;
    linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  }>;
}

/**
 * Function overload to preserve type safety
 * See: https://tanstack.com/router/latest/docs/guide/type-utilities#type-checking-link-options-with-validatelinkoptions
 */
export function PageTopBarBreadcrumbs<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
>(props: PageTopBarBreadcrumbsProps<TRouter, TOptions>): React.ReactNode;
export function PageTopBarBreadcrumbs({ items }: PageTopBarBreadcrumbsProps) {
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
