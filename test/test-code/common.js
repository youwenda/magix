function iniMagix() {
  return new Promise(resolve => {
    KISSY.use('magix', (S, M) => {
      window.Magix = M;
      resolve();
    });
  });
}