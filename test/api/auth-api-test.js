import { assert } from "chai";
import { playtimeService } from "./playtime-service.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { maggie, maggieCredentials } from "../fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    await playtimeService.clearAuth();
    await playtimeService.createUser(maggie);
    await playtimeService.authenticate(maggie);
    await playtimeService.deleteAllUsers();
  });

  test("Authenticate User", async () => {
    const returnedUser = await playtimeService.createUser(maggie);
    const response = await playtimeService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("Verify Token", async () => {
    const returnedUser = await playtimeService.createUser(maggie);
    const response = await playtimeService.authenticate(maggieCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });

  test("Check Unauthorized", async () => {
    await playtimeService.clearAuth();
    try {
      await playtimeService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });
});
