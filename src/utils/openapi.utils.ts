import { ApiResponse } from '@nestjs/swagger';

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
        const rOk = ApiResponse({ status: 200, type: ok, description: ok.name });
        const rIse = ApiResponse({ status: 502, type: ise });
        const rErrors = errors
            ? errors.map((e) =>
                  ApiResponse({ status: 200, type: e, description: `Error: ${e.name}` }),
              )
            : [];

        function decorator(
            prototype: Record<string, unknown>,
            _: symbol,
            descriptor: TypedPropertyDescriptor<() => unknown>,
        ) {
            const okDecorated = rOk(prototype, _, descriptor);
            if (!okDecorated) {
                throw new Error('OK descriptor must be identified');
            }
            const iseDecorated = rIse(prototype, _, okDecorated);
            if (!iseDecorated) {
                throw new Error('ISE descriptor must be identified');
            }

            const resultDescriptor = rErrors.reduce((p, c) => {
                if (!p) {
                    throw new Error('Descriptor must be identified');
                }
                return c(prototype, _, p);
            }, iseDecorated);
            return resultDescriptor;
        }

        return decorator;
    }

    return ApiResponses;
}
