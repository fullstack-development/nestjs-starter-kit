import { ApiResponse, ApiOkResponse, refs, ApiExtraModels } from '@nestjs/swagger';

export function makeApiResponsesDecorator<ISE>(ise: new () => ISE) {
    function ApiResponses<OK>(
        ok: new (...args: Array<unknown>) => OK,
    ): (
        p: unknown,
        _: unknown,
        descriptor: TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE>>,
    ) => TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE>>;
    function ApiResponses<OK, E1>(
        ok: new (...args: Array<unknown>) => OK,
        errors: [new (...args: Array<unknown>) => E1],
    ): (
        p: unknown,
        _: unknown,
        descriptor: TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE | E1>>,
    ) => TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE | E1>>;
    function ApiResponses<OK, E1, E2>(
        ok: new (...args: Array<unknown>) => OK,
        errors: [new (...args: Array<unknown>) => E1, new (...args: Array<unknown>) => E2],
    ): (
        p: unknown,
        _: unknown,
        descriptor: TypedPropertyDescriptor<
            (...props: Array<unknown>) => Promise<OK | ISE | E1 | E2>
        >,
    ) => TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE | E1 | E2>>;
    function ApiResponses<OK, E1, E2, E3>(
        ok: new (...args: Array<unknown>) => OK,
        errors: [
            new (...args: Array<unknown>) => E1,
            new (...args: Array<unknown>) => E2,
            new (...args: Array<unknown>) => E3,
        ],
    ): (
        p: unknown,
        _: unknown,
        descriptor: TypedPropertyDescriptor<
            (...props: Array<unknown>) => Promise<OK | ISE | E1 | E2 | E3>
        >,
    ) => TypedPropertyDescriptor<(...props: Array<unknown>) => Promise<OK | ISE | E1 | E2 | E3>>;
    function ApiResponses<OK, E1, E2, E3, E4>(
        ok: new (...args: Array<unknown>) => OK,
        errors: [
            new (...args: Array<unknown>) => E1,
            new (...args: Array<unknown>) => E2,
            new (...args: Array<unknown>) => E3,
            new (...args: Array<unknown>) => E4,
        ],
    ): (
        p: unknown,
        _: unknown,
        descriptor: TypedPropertyDescriptor<
            (...props: Array<unknown>) => Promise<OK | ISE | E1 | E2 | E3 | E4>
        >,
    ) => TypedPropertyDescriptor<
        (...props: Array<unknown>) => Promise<OK | ISE | E1 | E2 | E3 | E4>
    >;
    function ApiResponses(
        ok: new (...args: Array<unknown>) => unknown,
        errors?: Array<new (...args: Array<unknown>) => unknown>,
    ) {
        const rIse = ApiResponse({ status: 502, type: ise });

        function decorator(
            prototype: Record<string, unknown>,
            _: symbol,
            descriptor: TypedPropertyDescriptor<() => unknown>,
        ) {
            const iseDecorated = rIse(prototype, _, descriptor);
            if (!iseDecorated) {
                throw new Error('ISE descriptor must be identified');
            }

            let schemas = [ok];
            if (errors) {
                schemas = [...schemas, ...errors];
            }
            const responsesDescriptor = ApiOkResponse({
                schema: {
                    anyOf: refs(...schemas),
                },
            });
            const responsesDecorated = responsesDescriptor(prototype, _, iseDecorated);
            if (!responsesDecorated) {
                throw new Error('Responses descriptors must be identified');
            }

            const extraModelsDescriptor = ApiExtraModels(...schemas, ise);
            const resultDescriptor = extraModelsDescriptor(prototype, _, responsesDecorated);
            return resultDescriptor;
        }

        return decorator;
    }

    return ApiResponses;
}
