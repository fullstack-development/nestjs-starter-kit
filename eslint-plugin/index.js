const endpointDecorators = ['Post', 'Get', 'Delete', 'Put', 'Patch', 'Options', 'Head', 'All'];

module.exports.rules = {
    'provide-endpoint-return-type': {
        create: (context) => ({
            FunctionExpression: (node) => {
                if (
                    node.parent.parent.type === 'ClassBody' &&
                    node.parent.key.name !== 'constructor' &&
                    Array.isArray(node.parent.decorators)
                ) {
                    if (
                        node.parent.decorators.some(
                            (d) =>
                                d.expression &&
                                d.expression.callee &&
                                d.expression.callee.type === 'Identifier' &&
                                endpointDecorators.includes(d.expression.callee.name) &&
                                node.parent.value,
                        )
                    ) {
                        if (
                            !node.parent.decorators.some(
                                (d) => d.expression.callee.name === 'ApiResponses',
                            )
                        ) {
                            context.report({
                                node,
                                message: 'ApiResponses decorator is missing',
                            });
                        }
                    }
                }
            },
        }),
    },
};
