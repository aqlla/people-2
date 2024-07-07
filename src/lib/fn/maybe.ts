type None = { _type: 'none' }
type Some<T> = { _type: 'some', value: T }
type Maybe<T> = None | Some<T>

const none: None = { _type: 'none' }
const some = <T>(value: T): Some<T> => ({ _type: 'some', value })

// abstract class Either<L, R> {
//     constructor(readonly value: L | R) {}

//     static left<L>(value: L) {
//         return new Left(value);
//     }

//     static right<R>(value: R) {
//         return new Right(value);
//     }

//     abstract map<U>(fn: (r: R) => U): Either<L, U>;
//     abstract mapLeft<U>(fn: (l: L) => U): Either<U, R>;
//     // Other methods like flatMap, fold, etc., can be added here for completeness
// }

// class Left<L> extends Either<L, never> {
//     constructor(value: L) {
//         super(value);
//     }

//     map<U>(_: (r: never) => U): Either<L, U> {
//         return this;
//     }

//     mapLeft<U>(fn: (l: L) => U): Either<U, never> {
//         return new Left(fn(this.value as L));
//     }
// }

// class Right<R> extends Either<never, R> {
//     constructor(value: R) {
//         super(value);
//     }

//     map<U>(fn: (r: R) => U): Either<never, U> {
//         return new Right(fn(this.value as R));
//     }

//     mapLeft<U>(_: (l: never) => U): Either<never, R> {
//         return this;
//     }
// }


// abstract class Result<T, E> extends Either<E, T> {
//     static ok<T>(value: T) {
//         return new Right(value);
//     }

//     static err<E>(error: E) {
//         return new Left(error);
//     }

//     // You can override or extend methods specifically for Result if needed
//     // For instance, providing a method that directly handles the error case
//     isOk(): this is Right<T> {
//         return this instanceof Right;
//     }

//     isErr(): this is Left<E> {
//         return this instanceof Left;
//     }
// }

// class Ok<T> extends Result<T, never> {
    
// }

// // const Ok = <T>(value: T): Result<T, never> => Right(value);
// const Err = <E>(error: E): Result<never, E> => Left(error);