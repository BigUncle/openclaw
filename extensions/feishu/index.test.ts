import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenClawPluginApi } from "../../src/plugins/types.js";
import { createTestPluginApi } from "../../test/helpers/extensions/plugin-api.js";

const registerFeishuDocToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuChatToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuWikiToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuDriveToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuPermToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuBitableToolsMock = vi.hoisted(() => vi.fn());
const registerFeishuSubagentHooksMock = vi.hoisted(() => vi.fn());
const setFeishuRuntimeMock = vi.hoisted(() => vi.fn());
const feishuPluginImplMock = vi.hoisted(() => ({ id: "feishu" }));

vi.mock("./src/channel.js", () => ({
  feishuPlugin: feishuPluginImplMock,
}));

vi.mock("./src/docx.js", () => ({
  registerFeishuDocTools: registerFeishuDocToolsMock,
}));

vi.mock("./src/chat.js", () => ({
  registerFeishuChatTools: registerFeishuChatToolsMock,
}));

vi.mock("./src/wiki.js", () => ({
  registerFeishuWikiTools: registerFeishuWikiToolsMock,
}));

vi.mock("./src/drive.js", () => ({
  registerFeishuDriveTools: registerFeishuDriveToolsMock,
}));

vi.mock("./src/perm.js", () => ({
  registerFeishuPermTools: registerFeishuPermToolsMock,
}));

vi.mock("./src/bitable.js", () => ({
  registerFeishuBitableTools: registerFeishuBitableToolsMock,
}));

vi.mock("./src/runtime.js", () => ({
  setFeishuRuntime: setFeishuRuntimeMock,
}));

vi.mock("./src/subagent-hooks.js", () => ({
  registerFeishuSubagentHooks: registerFeishuSubagentHooksMock,
}));

import feishuPlugin from "./index.js";

const FEISHU_FULL_REGISTRATION_RUNTIMES = Symbol.for("openclaw.feishu.full-registration-runtimes");

function resetFeishuFullRegistrationState() {
  delete (globalThis as Record<PropertyKey, unknown>)[FEISHU_FULL_REGISTRATION_RUNTIMES];
}

function createApi(
  registrationMode: OpenClawPluginApi["registrationMode"] = "full",
  runtime: OpenClawPluginApi["runtime"] = {} as OpenClawPluginApi["runtime"],
) {
  const registerChannel = vi.fn();
  const api = createTestPluginApi({
    id: "feishu",
    name: "Feishu",
    source: "test",
    config: {},
    runtime,
    registrationMode,
    registerChannel,
  }) as OpenClawPluginApi;

  return { api, registerChannel };
}

describe("feishu plugin entry", () => {
  beforeEach(() => {
    resetFeishuFullRegistrationState();
    vi.clearAllMocks();
  });

  it("registers channel setup on every register call", () => {
    const { api, registerChannel } = createApi("setup-runtime");

    feishuPlugin.register(api);
    feishuPlugin.register(api);

    expect(setFeishuRuntimeMock).toHaveBeenCalledTimes(2);
    expect(registerChannel).toHaveBeenCalledTimes(2);
    expect(registerFeishuSubagentHooksMock).not.toHaveBeenCalled();
    expect(registerFeishuDocToolsMock).not.toHaveBeenCalled();
    expect(registerFeishuChatToolsMock).not.toHaveBeenCalled();
    expect(registerFeishuWikiToolsMock).not.toHaveBeenCalled();
    expect(registerFeishuDriveToolsMock).not.toHaveBeenCalled();
    expect(registerFeishuPermToolsMock).not.toHaveBeenCalled();
    expect(registerFeishuBitableToolsMock).not.toHaveBeenCalled();
  });

  it("dedupes full registration for repeated loads on the same runtime", () => {
    const runtime = {} as OpenClawPluginApi["runtime"];
    const { api, registerChannel } = createApi("full", runtime);

    feishuPlugin.register(api);
    feishuPlugin.register(api);

    expect(setFeishuRuntimeMock).toHaveBeenCalledTimes(2);
    expect(registerChannel).toHaveBeenCalledTimes(2);

    expect(registerFeishuSubagentHooksMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuDocToolsMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuChatToolsMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuWikiToolsMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuDriveToolsMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuPermToolsMock).toHaveBeenCalledTimes(1);
    expect(registerFeishuBitableToolsMock).toHaveBeenCalledTimes(1);
  });

  it("allows full registration on distinct runtimes", () => {
    const runtime1 = {} as OpenClawPluginApi["runtime"];
    const runtime2 = {} as OpenClawPluginApi["runtime"];
    const { api: api1, registerChannel: registerChannel1 } = createApi("full", runtime1);
    const { api: api2, registerChannel: registerChannel2 } = createApi("full", runtime2);

    feishuPlugin.register(api1);
    feishuPlugin.register(api2);

    expect(setFeishuRuntimeMock).toHaveBeenCalledTimes(2);
    expect(registerChannel1).toHaveBeenCalledTimes(1);
    expect(registerChannel2).toHaveBeenCalledTimes(1);
    expect(registerFeishuSubagentHooksMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuDocToolsMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuChatToolsMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuWikiToolsMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuDriveToolsMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuPermToolsMock).toHaveBeenCalledTimes(2);
    expect(registerFeishuBitableToolsMock).toHaveBeenCalledTimes(2);
  });
});
