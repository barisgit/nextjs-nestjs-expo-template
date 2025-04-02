import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "@repo/ui/components/base/button"; // Corrected path

describe("Button Component", () => {
  test("renders button with children", () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test("applies variant class", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole("button", { name: /delete/i });
    expect(buttonElement).toHaveClass("bg-destructive"); // Adjust class assertion based on your actual Button styles
  });
});
