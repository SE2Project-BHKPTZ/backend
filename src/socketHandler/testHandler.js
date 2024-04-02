module.exports = () => {
  const test = function (payload) {
    const socket = this; // hence the 'function' above, as an arrow function will not work

    socket.emit('test:test', payload);
  };

  return {
    test,
  };
};
