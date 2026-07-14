import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("resume builder app", () => {
  it("renders the editor, toolbar, and live preview", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "在线简历编辑器" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 PDF/ })).toBeInTheDocument();
    expect(screen.getByLabelText("姓名")).toBeInTheDocument();
    expect(screen.getByTestId("resume-preview")).toBeInTheDocument();
  });

  it("updates the preview when profile fields change", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "王小明" },
    });

    expect(
      within(screen.getByTestId("resume-preview")).getByText("王小明"),
    ).toBeInTheDocument();
  });

  it("switches between built-in templates without losing edited data", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "陈雨" },
    });
    fireEvent.click(screen.getByRole("button", { name: /紧凑时间线/ }));

    expect(screen.getByTestId("resume-template-compact")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("resume-preview")).getByText("陈雨"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /现代侧栏/ }));

    expect(screen.getByTestId("resume-template-sidebar")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("resume-preview")).getByText("陈雨"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /参考单栏/ }));

    expect(screen.getByTestId("resume-template-classic")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("resume-preview")).getByText("陈雨"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /宁德时代/ }));

    expect(screen.getByTestId("resume-template-ningde")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("resume-preview")).getByText("陈雨"),
    ).toBeInTheDocument();
  });

  it("does not expose measurement mode as a layout-changing preview class", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /紧凑时间线/ }));

    expect(screen.getByTestId("resume-preview")).not.toHaveClass("fit-mode-expand");
    expect(screen.getByTestId("resume-preview")).not.toHaveClass("fit-mode-compress");
  });

  it("keeps the A4 page fixed while scaling only the preview shell", () => {
    render(<App />);

    const preview = screen.getByTestId("resume-preview");
    const shell = preview.parentElement;
    const stage = shell?.parentElement;

    expect(preview).toHaveClass("resume-page");
    expect(shell).toHaveClass("resume-page-shell");
    expect(stage).toHaveClass("resume-stage");
  });

  it("opens the custom template workspace and creates an editable template", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "我的模板" }));
    fireEvent.click(screen.getByRole("button", { name: "新建空白模板" }));

    expect(screen.getByText("模板设计")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "单栏" })).toBeInTheDocument();
    expect(screen.getByTestId("resume-template-custom")).toBeInTheDocument();
  });

  it("renames a built-in template label from the template panel", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "我的模板" }));
    fireEvent.change(screen.getByDisplayValue("宁德时代"), {
      target: { value: "能源行业模板" },
    });

    expect(screen.getByRole("button", { name: "能源行业模板" })).toBeInTheDocument();
  });

  it("shows the job intention label in the preview", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /参考单栏/ }));

    expect(within(screen.getByTestId("resume-preview")).getByText(/求职意向：/)).toBeInTheDocument();
  });

});
