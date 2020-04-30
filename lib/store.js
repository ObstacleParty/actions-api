module.exports = function () {
  const store = {};
  return {
    get: (id) => store[id],
    getAll: () => store,
    set: (id, value) => store[id] = value,
    delete: (id) => delete store[id]
  };
}();