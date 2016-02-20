const TIMEOUT = 1000000;

export default function (name, options) {
  describe('', function () {
    var bench;
    var title = this.fullTitle();

    // Ensure perf tests have enough time to cleanup after themselves.
    afterEach(function () {
      this.timeout(TIMEOUT);
    });

    beforeEach(function () {
      options = typeof options === 'function' ? options() : options;
      options.name = `${title}${name}`;

      /* global Benchmark: false */
      bench = new Benchmark(options);
    });

    it(name, function (done) {
      this.title = options.name;
      this.timeout(TIMEOUT);

      bench.on('complete', function (e) {
        /* global alert: false */
        alert(`${String(e.target)}`);
        done();
      });

      bench.run();
    });
  });
}