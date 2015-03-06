/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "abort";
    },

    process: function(leaf, state) {
        state.print(leaf.name);
        state.println(".reject('Promise Execution Aborted');");
    }

};