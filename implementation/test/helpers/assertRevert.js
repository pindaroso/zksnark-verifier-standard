//For times when we expect a test to 'revert', this checks whether that 'revert' takes place or not.
async function assertRevert(promise) {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
}

module.exports = assertRevert;
