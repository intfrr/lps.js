const Program = require('../../parser/Program');

function Consult(targetProgram) {
  this.consultFile = function consultFile(file) {
    return Program.fromFile(file)
      .then((loadedProgram) => {
        targetProgram.augment(loadedProgram);
        return Promise.resolve(loadedProgram);
      });
  };

  let processConsultDeclarations = function processConsultDeclarations(currentProgram) {
    let promises = [];
    let result = currentProgram.query(Program.literal('consult(File)'));
    result.forEach((r) => {
      if (r.theta.File === undefined || !(r.theta.File instanceof Value)) {
        return;
      }
      let promise = this.consultFile(r.theta.File.evaluate())
        .then((loadedProgram) => {
          // recursively process consult declarations in loaded targetProgram
          return processConsultDeclarations(loadedProgram);
        });
      promises.push(promise);
    });
    return Promise.all(promises);
  };

  this.processConsult = function processConsult() {
    return processConsultDeclarations(targetProgram);
  }
}

module.exports = Consult;