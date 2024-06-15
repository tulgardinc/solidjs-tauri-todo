import { For, Show, createResource, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { window as tauriWindow } from "@tauri-apps/api";
import "./style/output.css";
import TodoItem from "./Todo";
import type { JSX } from "solid-js";
import { Todo } from "./types";
import { FaRegularSquareFull } from "solid-icons/fa";
import { VsChromeMinimize } from "solid-icons/vs";
import { AiOutlineClose } from "solid-icons/ai";
import Titlebar from "./Titlebar";

const getTodos = async (): Promise<Todo[]> => {
    const todosString: string = await invoke("get_todos");
    console.log(todosString);
    return JSON.parse(todosString);
};

function App() {
    const [todoName, setTodoName] = createSignal("");
    const [todos, { mutate }] = createResource(getTodos);

    const handleAddTodo: JSX.EventHandler<
        HTMLFormElement,
        SubmitEvent
    > = async (event) => {
        event.preventDefault();
        if (todoName().trim() === "") return;

        const tempId = Date.now();

        mutate((todos) => [
            ...(todos || []),
            {
                id: tempId,
                name: todoName(),
                done: false,
            },
        ]);

        invoke<string>("add_todo", { name: todoName() }).then((resp) => {
            const newId = Number.parseInt(resp);
            mutate(
                (todos) =>
                    todos?.map((todo) =>
                        todo.id === tempId ? { ...todo, id: newId } : todo
                    ) || []
            );
        });
        setTodoName("");
    };

    const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
        setTodoName(e.currentTarget.value);
    };

    const handleToggleTodo = (id: number) => {
        invoke<string>("toggle_todo", { id: id }).then((resp) =>
            console.log(resp)
        );

        mutate(
            (todos) =>
                todos?.map((todo) =>
                    todo.id === id ? { ...todo, done: !todo.done } : todo
                ) || []
        );
    };

    const deleteTodo = (id: number) => {
        invoke<string>("delete_todo", { id: id }).then((resp) =>
            console.log(resp)
        );

        mutate((todos) => todos?.filter((todo) => todo.id !== id));
    };

    return (
        <div class="w-screen h-screen flex flex-col">
            <Titlebar />
            <div class="flex-grow w-full relative">
                <div class="w-full h-full flex justify-center items-center">
                    <div class="w-3/5 h-[500px] flex flex-col">
                        <h1 class="text-5xl font-bold">Todos</h1>
                        <hr class="my-5 border-t-2" />
                        <div class="flex-grow overflow-auto">
                            <Show when={!todos.loading} fallback={"Loading..."}>
                                <For each={todos()}>
                                    {(todo) => (
                                        <TodoItem
                                            deleteTodo={deleteTodo}
                                            toggleTodo={handleToggleTodo}
                                            todo={todo}
                                        />
                                    )}
                                </For>
                            </Show>
                        </div>
                        <hr class="my-5 border-t-2" />
                        <form class="flex gap-3" onSubmit={handleAddTodo}>
                            <input
                                placeholder="New todo"
                                class="flex-grow border-b-2 box-border px-3 py-1"
                                value={todoName()}
                                onInput={handleInput}
                            />
                            <button
                                type="submit"
                                class="bg-blue-500 hover:bg-blue-700 box-border px-3 py-1 text-white rounded-lg font-semibold"
                            >
                                Add Todo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
