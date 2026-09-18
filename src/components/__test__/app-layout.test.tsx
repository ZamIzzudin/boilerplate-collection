import { render, screen } from "@testing-library/react";
import { AppLayout } from "../app-layout";

jest.mock("@phosphor-icons/react", () => ({
  UserIcon: () => <span data-testid="user-icon" />,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  AvatarFallback: ({ children }: any) => <span data-testid="avatar-fallback">{children}</span>,
  AvatarImage: (props: any) => <img data-testid="avatar-image" {...props} />,
}));

describe("AppLayout", () => {
  it("renders children", () => {
    render(
      <AppLayout>
        <div data-testid="child">Content</div>
      </AppLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders string title", () => {
    render(
      <AppLayout title="My Title">
        <div />
      </AppLayout>,
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders ReactNode title", () => {
    render(
      <AppLayout title={<span data-testid="custom-title">Custom</span>}>
        <div />
      </AppLayout>,
    );
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <AppLayout title="Title" description="Some description">
        <div />
      </AppLayout>,
    );
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders actions", () => {
    render(
      <AppLayout title="Title" actions={<button data-testid="action-btn">Action</button>}>
        <div />
      </AppLayout>,
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders image fallback (AvatarFallback) when isImage is false", () => {
    render(
      <AppLayout title="Title" image="logo.png" imageAlt="Logo" isImage={false}>
        <div />
      </AppLayout>,
    );
    // Komponen menampilkan ikon user di fallback (bukan inisial teks)
    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("renders AvatarImage when isImage is true", () => {
    render(
      <AppLayout title="Title" image="logo.png" imageAlt="Logo" isImage>
        <div />
      </AppLayout>,
    );
    expect(screen.getByTestId("avatar-image")).toHaveAttribute("src", "logo.png");
  });

  it("does not render avatar when image is not provided", () => {
    render(
      <AppLayout title="Title">
        <div />
      </AppLayout>,
    );
    expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
  });
});
