/**
 * Function Processor for the CellScript to JS Compiler.
 */

var INQ_REQUIRE = "inq-core";

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "async";
    },

    process: function(leaf, state) {
        if(leaf.subtype == "inq") {
            if(leaf.definition) {
                /*state.print('var');
                state.meaningfulSpace();
                state.print('inq');
                state.print(' = ');
                state.print('inq');
                state.print(' || ');*/
                state.print('require("' + INQ_REQUIRE + '")');
            }
            else {
                state.print("inq(" + leaf.name + ")");
            }
        }
        else {
            if(leaf.asyncName) {
                state.print("var");
                state.meaningfulSpace();
                state.print(leaf.asyncName);
                state.print(" = ");
            }
            if (leaf.statement.type == "block") state.print("inq(function* () ");
            else {
                state.println("inq(function* () {");
                state.levelDown();
            }

            state.processor.leaf(leaf.statement, state);

            if (leaf.statement.type == "block") state.print(")");
            else {
                state.levelUp();
                state.print("})");
            }
        }

        if(leaf.items[0] && leaf.items[0].type === "catch") {
            state.print(".error(function(");
            state.print(leaf.name);
            state.print(") ");
            state.println("{");
            state.levelDown();
            state.processor.level(leaf.items[0].items, state);
            state.levelUp();
            state.print("})");
            leaf.items.shift();
        }

        if(leaf.items[0] && leaf.items[0].type === "finally") {
            state.print(".done(function() ");
            state.println("{");
            state.levelDown();
            state.processor.level(leaf.items[0].items, state);
            state.levelUp();
            state.print("})");
            leaf.items.shift();
        }

        state.println(";");
    }

};