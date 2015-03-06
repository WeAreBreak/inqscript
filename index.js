/**
 * Compiler Module Definition for the InqScript Language.
 */

module.exports = function compilerModuleDefinition() {
    this.language = "InqScript";

    this.tokens = {
        'identifier': require('./lib/tokenizer/identifier'),
        'punctuation': require('./lib/tokenizer/punctuation')
    };

    this.parsers = {
        'async': require('./lib/parser/async'),
        'inq': require('./lib/parser/inq'),
        'abort': require('./lib/parser/abort'),
        'require': require('./lib/parser/require'),
        'expression.js': require('./lib/parser/expression'),
        'function.js': require('./lib/parser/function')
    };

    this.expressionParsers = {
        'unary': require('./lib/expressionParser/unary'),
        'lefthandside': require('./lib/expressionParser/lefthandside'),
        'function': require('./lib/expressionParser/function')
    };

    this.compilers = {
        'async': require('./lib/compiler/async'),
        'await': require('./lib/compiler/await'),
        'task': require('./lib/compiler/task'),
        'wait': require('./lib/compiler/wait'),
        'unary': require('./lib/compiler/unary'),
        'taskArguments': require('./lib/compiler/taskArguments'),
        'lefthandside': require('./lib/compiler/lefthandside'), //TODO: DO NOT OVERRIDE!
        'bound': require('./lib/compiler/bound'),
        'abort': require('./lib/compiler/abort'),
        'require': require('./lib/compiler/require'),
        'function': require('./lib/compiler/function')
    };
};