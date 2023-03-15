import { assert } from "chai";
import { EventEmitter } from "events"; // Suppress console messages about memory leaks
import { db } from "../../src/models/db.js";
import { testPlaylists, mozart } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("Playlist Model tests", () => {
  setup(async () => {
    db.init("mongo");
    await db.playlistStore.deleteAllPlaylists();
    for (let i = 0; i < testPlaylists.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testPlaylists[i] = await db.playlistStore.addPlaylist(testPlaylists[i]);
    }
  });

  test("Create playlist", async () => {
    EventEmitter.setMaxListeners(25);
    const playlist = await db.playlistStore.addPlaylist(mozart);
    assertSubset(mozart, playlist);
    assert.isDefined(playlist._id);
  });

  test("Delete all playlists", async () => {
    let returnedPlaylists = await db.playlistStore.getAllPlaylists();
    assert.equal(returnedPlaylists.length, 3);
    await db.playlistStore.deleteAllPlaylists();
    returnedPlaylists = await db.playlistStore.getAllPlaylists();
    assert.equal(returnedPlaylists.length, 0);
  });

  test("Get playlist - success", async () => {
    const playlist = await db.playlistStore.addPlaylist(mozart);
    const returnedPlaylist = await db.playlistStore.getPlaylistById(playlist._id);
    assertSubset(mozart, playlist);
  });

  test("Delete playlist - success", async () => {
    const id = testPlaylists[0]._id;
    await db.playlistStore.deletePlaylistById(id);
    const returnedPlaylists = await db.playlistStore.getAllPlaylists();
    assert.equal(returnedPlaylists.length, testPlaylists.length - 1);
    const deletedPlaylist = await db.playlistStore.getPlaylistById(id);
    assert.isNull(deletedPlaylist);
  });

  test("Get playlist - bad params", async () => {
    assert.isNull(await db.playlistStore.getPlaylistById(""));
    assert.isNull(await db.playlistStore.getPlaylistById());
  });

  test("Delete playlist - fail", async () => {
    await db.playlistStore.deletePlaylistById("bad-id");
    const allPlaylists = await db.playlistStore.getAllPlaylists();
    assert.equal(testPlaylists.length, allPlaylists.length);
  });
});
