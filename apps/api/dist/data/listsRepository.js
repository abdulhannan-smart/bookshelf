"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLists = getAllLists;
exports.getListById = getListById;
exports.createList = createList;
exports.deleteList = deleteList;
exports.addBookToList = addBookToList;
exports.removeBookFromList = removeBookFromList;
const uuid_1 = require("uuid");
const jsonStore_1 = require("./jsonStore");
const FILE = "lists.json";
async function getAllLists() {
    return (0, jsonStore_1.readJson)(FILE);
}
async function getListById(id) {
    const lists = await getAllLists();
    return lists.find((l) => l.id === id);
}
async function createList(input) {
    const lists = await getAllLists();
    const newList = {
        ...input,
        id: `list_${(0, uuid_1.v4)().replace(/-/g, "").slice(0, 8)}`,
        bookIds: [],
        createdAt: new Date().toISOString(),
    };
    lists.push(newList);
    await (0, jsonStore_1.writeJson)(FILE, lists);
    return newList;
}
async function deleteList(id) {
    const lists = await getAllLists();
    const index = lists.findIndex((l) => l.id === id);
    if (index === -1)
        return false;
    lists.splice(index, 1);
    await (0, jsonStore_1.writeJson)(FILE, lists);
    return true;
}
async function addBookToList(id, bookId) {
    const lists = await getAllLists();
    const list = lists.find((l) => l.id === id);
    if (!list)
        return undefined;
    if (!list.bookIds.includes(bookId)) {
        list.bookIds.push(bookId);
        await (0, jsonStore_1.writeJson)(FILE, lists);
    }
    return list;
}
async function removeBookFromList(id, bookId) {
    const lists = await getAllLists();
    const list = lists.find((l) => l.id === id);
    if (!list)
        return undefined;
    const index = list.bookIds.indexOf(bookId);
    if (index !== -1) {
        list.bookIds.splice(index, 1);
        await (0, jsonStore_1.writeJson)(FILE, lists);
    }
    return list;
}
//# sourceMappingURL=listsRepository.js.map