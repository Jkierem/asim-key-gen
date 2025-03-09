import { Match, Option, pipe } from "effect";

export const ErrorMessage = ({ error }: { error: Option.Option<string>}) => pipe(
    Match.value(error),
    Match.tags({
      None: () => <></>,
      Some: ({ value }) => <div className='error'>{value}</div>
    }),
    Match.exhaustive
)