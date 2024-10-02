export {};

declare global {
  type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
}
