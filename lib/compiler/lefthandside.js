/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    forceOverride: true,

    canProcess: function(leaf) {
        return leaf.type === "lefthandside";
    },

    process: function(leaf, state) {
        if(leaf.bound) state.print("inq.bound(");

        for(var i = 0; i < leaf.items.length; ++i) {
            state.processor.leaf(leaf.items[i], state);
        }

        if(leaf.bound) state.print(")");
    }

};