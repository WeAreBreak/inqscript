/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    methods: {
        canProcess: function (leaf) {
            if(leaf.type === "unary" && (leaf.subtype == "await" || leaf.subtype == "wait" || leaf.subtype == "task" || leaf.subtype == "bound")) return false;
        }
    }

};