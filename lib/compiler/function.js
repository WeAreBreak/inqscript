/**
 * Function Processor for the JavaScript+ to JS Compiler.
 */

/// public interface ///
module.exports = {

    methods: {

        'before-body': function (leaf, state) {
            if(leaf.async) {
                state.println("inq(function*(){");
                state.levelDown();
            }
        },

        'after-body': function (leaf, state) {
            if(leaf.async) {
                state.levelUp();
                state.println("})");
            }
        }

    }

};