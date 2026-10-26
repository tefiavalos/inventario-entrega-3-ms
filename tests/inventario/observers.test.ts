import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

import { InventoryManager } from "../../src/inventario/InventoryManager";
import { AnalyticsObserver } from "../../src/inventario/observers/AnalyticsObserver";
import { PushNotificationObserver } from "../../src/inventario/observers/PushNotificationObserver";

beforeEach(() => mock.method(console, "log", () => {}));
afterEach(() => mock.restoreAll());

describe("Observadores de stock bajo", () => {
  it("AnalyticsObserver registra el evento low_stock", () => {
    // Arrange
    const manager = new InventoryManager();
    const analytics = new AnalyticsObserver();
    manager.subscribe(analytics);

    // Act
    manager.update_stock("PROD-002", 3);

    // Assert
    assert.deepEqual(analytics.events, ["low_stock PROD-002"]);
  });

  it("PushNotificationObserver envía la cantidad restante", () => {
    // Arrange
    const manager = new InventoryManager();
    const push = new PushNotificationObserver();
    manager.subscribe(push);

    // Act
    manager.update_stock("PROD-002", 3);

    // Assert
    assert.deepEqual(push.notifications, ["Quedan 3 unidades de PROD-002"]);
  });
});
