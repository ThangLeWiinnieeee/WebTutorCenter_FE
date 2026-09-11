import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

// Replace only the HTTP dependency; exercise the real service implementation.
test("settings reads share pending requests and refresh after success, save, or failure", async () => {
  const source = await readFile(new URL("../src/services/settingsService.js", import.meta.url), "utf8");
  const requests = [];
  const axiosInstance = {
    get(path) {
      assert.equal(path, "/settings/footer");
      return new Promise((resolve, reject) => requests.push({ resolve, reject }));
    },
    async put(path, payload) {
      assert.equal(path, "/settings/footer");
      return { data: { data: payload } };
    },
  };
  const createService = new Function("axiosInstance", source
    .replace('import axiosInstance from "@/services/axiosInstance";', "")
    .replace("export default settingsService;", "return settingsService;"));
  const service = createService(axiosInstance);
  const first = service.getFooter();
  assert.equal(service.getFooter(), first);
  assert.equal(requests.length, 1);
  requests[0].resolve({ data: { data: { phone: "0900000001" } } });
  await first;

  const second = service.getFooter();
  assert.equal(requests.length, 2);
  requests[1].resolve({ data: { data: { phone: "0900000002" } } });
  assert.equal((await second).data.data.phone, "0900000002");

  await service.updateFooter({ phone: "0900000003" });
  const afterSave = service.getFooter();
  assert.equal(requests.length, 3);
  requests[2].resolve({ data: { data: { phone: "0900000004" } } });
  assert.equal((await afterSave).data.data.phone, "0900000004");

  const failed = service.getFooter();
  requests[3].reject(new Error("Offline"));
  await assert.rejects(failed, /Offline/);
  const retry = service.getFooter();
  assert.equal(requests.length, 5);
  requests[4].resolve({ data: { data: {} } });
  assert.deepEqual((await retry).data.data, {});
});
