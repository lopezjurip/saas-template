import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PolymorphicProps } from "./polymorphic";

function Box<T extends React.ElementType = "div">({ as, children, ...props }: PolymorphicProps<T>) {
  const Component = (as || "div") as React.ElementType;
  return <Component {...props}>{children}</Component>;
}

describe("PolymorphicProps", () => {
  it("renders default element", () => {
    render(<Box data-testid="box">content</Box>);
    expect(screen.getByTestId("box").tagName).toBe("DIV");
  });

  it("renders as another HTML element", () => {
    render(
      <Box as="section" data-testid="box">
        content
      </Box>,
    );
    expect(screen.getByTestId("box").tagName).toBe("SECTION");
  });

  it("renders as a custom component", () => {
    function CustomLink({ href, children, ...props }: React.ComponentPropsWithRef<"a">) {
      return (
        <a href={href} data-custom {...props}>
          {children}
        </a>
      );
    }

    render(
      <Box as={CustomLink} href="/home" data-testid="box">
        link
      </Box>,
    );
    const el = screen.getByTestId("box");
    expect(el.tagName).toBe("A");
    expect(el.hasAttribute("data-custom")).toBe(true);
    expect(el.getAttribute("href")).toBe("/home");
  });

  it("forwards ref", () => {
    let ref: HTMLButtonElement | null = null;
    render(
      <Box
        as="button"
        ref={(el) => {
          ref = el;
        }}
        data-testid="box"
      >
        click
      </Box>,
    );
    expect(ref).toBe(screen.getByTestId("box"));
  });

  it("passes own props without leaking to DOM", () => {
    type CardProps<T extends React.ElementType = "div"> = PolymorphicProps<T, { elevated?: boolean }>;
    function Card<T extends React.ElementType = "div">({ as, elevated: _elevated, ...props }: CardProps<T>) {
      const Component = (as || "div") as React.ElementType;
      return <Component {...props} />;
    }

    render(
      <Card elevated data-testid="card">
        content
      </Card>,
    );
    expect(screen.getByTestId("card").hasAttribute("elevated")).toBe(false);
  });
});
