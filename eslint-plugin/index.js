const endpointDecorators = ['Post', 'Get', 'Delete', 'Put', 'Patch', 'Options', 'Head', 'All'];

const noTypeError = (context, node) =>
    context.report({
        node,
        message: 'Endpoint method must have an explicit return type',
    });
const wrongTypeError = (context, node) =>
    context.report({
        node,
        message:
            'The return type of the endpoint method must be ControllerResponse or Promise<ControllerResponse>',
    });

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
                        if (!node.parent.value.returnType) {
                            noTypeError(context, node);
                        } else {
                            const annotation = node.parent.value.returnType.typeAnnotation;
                            if (annotation.typeName.name === 'Promise') {
                                console.log(annotation.typeParameters);
                                if (
                                    !annotation.typeParameters ||
                                    !annotation.typeParameters.params ||
                                    !annotation.typeParameters.params[0] ||
                                    !annotation.typeParameters.params[0].typeName ||
                                    annotation.typeParameters.params[0].typeName.name !==
                                        'ControllerResponse'
                                ) {
                                    wrongTypeError(context, node);
                                }
                            } else if (annotation.typeName.name !== 'ControllerResponse') {
                                wrongTypeError(context, node);
                            }
                        }
                    }
                }
            },
        }),
    },
};
