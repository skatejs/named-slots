const TIMEOUT = 1000000;

export default (name, options) => {
  describe('', () => {
    var bench;
    var title = this.fullTitle();

    // Ensure perf tests have enough time to cleanup after themselves.
    afterEach(() => {
      this.timeout(TIMEOUT);
    });

    beforeEach(() => {
      options = typeof options === 'function' ? options() : options;
      options.name = `${title}${name}`;

      /* global Benchmark: false */
      bench = new Benchmark(options);
    });

    it(name, (done) => {
      this.title = options.name;
      this.timeout(TIMEOUT);

      bench.on('complete', (e) => {
        /* global alert: false */
        alert(`${String(e.target)}`);
        done();
      });

      bench.run();
    });
  });
}
