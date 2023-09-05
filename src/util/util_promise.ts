/**
 * isPromise
 * @param p
 */
function isPromise(p: any): boolean {
  return typeof p === 'object' && typeof p.then === 'function';
}

/**
 * returnsPromise
 * @param f
 */
function returnsPromise(f: Function) {
  if (f.constructor.name === 'AsyncFunction' || (typeof f === 'function' && isPromise(f()))) {
    console.log('✅ Function returns promise');
    return true;
  }

  console.log('⛔️ Function does NOT return promise');
  return false;
}

export { isPromise, returnsPromise };
