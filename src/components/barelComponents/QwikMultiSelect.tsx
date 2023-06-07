import {
    component$,
    useStore,
    useSignal,
    $,
    type QwikMouseEvent,
    useComputed$,
    useVisibleTask$,
  } from "@builder.io/qwik";
import HighlightedText from "~/utils/HighlightedText";
  
  export type SelectOption = {
    label: string;
    value: string;
    selected?: boolean;
    id: string;
  };
  
  export const useMultiSelect = (options: SelectOption[]) => {
    const selectedOptions = useStore(options);
  
    const clear = $((e: any) => {
      // QwikMouseEvent<QwikCustomHTMLElement, MouseEvent> propus to qwik core change this
      e.stopPropagation();
      selectedOptions.forEach((item) => {
        item.selected = false;
      });
    });
  
    const clearOne = $(
      (e: QwikMouseEvent<HTMLElement, MouseEvent>, element: HTMLLIElement) => {
        e.stopPropagation();
        const value = element.getAttribute("data-value");
        const selectedOption = selectedOptions.find(
          (item) => item.value === value
        );
        if (!selectedOption) return;
        selectedOption.selected = false;
      }
    );
  
    const add = $(
      (e: QwikMouseEvent<HTMLElement, MouseEvent>, element: HTMLLIElement) => {
        const value = element.getAttribute("data-value");
        const selectedOption = selectedOptions.find(
          (item) => item.value === value
        );
        if (!selectedOption) return;
        selectedOption.selected = !selectedOption.selected;
      }
    );
  
    return {
      options: selectedOptions,
      clear,
      clearOne,
      add,
    };
  };
  
  export type MultiSelectProps = ReturnType<typeof useMultiSelect>;
  
  export default component$((props: MultiSelectProps) => {
    const isShow = useSignal(false);
  
    const isKeyBoardHover = useSignal(0);
  
    const onMouseEnterHover = (index: number) =>
      $(() => (isKeyBoardHover.value = index));
  
    const toggleShow = $(() => (isShow.value = !isShow.value));
  
    const stopPropagation = $(
      (event: QwikMouseEvent<HTMLInputElement, MouseEvent>) =>
        event.stopPropagation()
    );
  
    const CreateNewOptionAndPush = $(
      (query: string) => {
        const newOption = {
          label: query,
          value: query,
          selected: true,
          id: query,
        };
        props.options.push(newOption);
        searchQuery.value = "";
      }
    );
  
    const ulRef = useSignal<HTMLUListElement | undefined>(undefined);
  
    // search logic starts here
  
    const searchRef = useSignal<HTMLInputElement | undefined>(undefined);
  
    const searchQuery = useSignal("");
  
    const onSearchInput = $((event: Event, element: HTMLInputElement) => {
      searchQuery.value = element.value;
    });
  
    const computeSearch = useComputed$(() => {
      const query = searchQuery.value.trim();
      if (query === "") return props.options;
      return props.options.filter((item) => {
        const includesQuery = item.label
          .toLowerCase()
          .includes(query.toLowerCase());
        if (!includesQuery) return;
        return <HighlightedText text={item.label} query={query} />;
      });
    });
  
    const exactMatch = useComputed$(() => {
      const query = searchQuery.value.trim();
      if (query === "") return;
      return props.options.find((item) => item.label === query);
    });
  
    const onClickCreateNewOption = $(
      (event: QwikMouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        const query = searchQuery.value.trim();
        if (query === "" || query.length < 1) return;
        CreateNewOptionAndPush(query);
      }
    );
  
    // part of keyboard navigation and focus/click outside logic
    useVisibleTask$(({ track, cleanup }) => {
      track(() => isShow.value);
      if (!isShow.value) return;
      searchRef.value?.focus();
      isKeyBoardHover.value = 0;
      // on click outside
      const listen = function (e: MouseEvent) {
        const isClickedOutside = ulRef.value?.contains(e.target as Node);
        if (isClickedOutside) return;
        isShow.value = false;
      };
      // keyboard navigation logic starts here
      const onKeyDown = function (event: KeyboardEvent) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          isKeyBoardHover.value = Math.min(
            isKeyBoardHover.value + 1,
            props.options.length - 1
          );
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          isKeyBoardHover.value = Math.max(isKeyBoardHover.value - 1, 0);
        }
        if (event.key === "Enter") {
          event.preventDefault();
          if (computeSearch.value.length === 0) {
            const query = searchQuery.value.trim();
            if (query === "" || query.length < 1) return;
            return CreateNewOptionAndPush(query)
          }
          const selectedOption = props.options[isKeyBoardHover.value];
          if (!selectedOption) return;
          selectedOption.selected = !selectedOption.selected;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          isShow.value = false;
        }
        if (event.key === "Tab") {
          isShow.value = false;
        }
      };
  
      document.body.addEventListener("click", listen);
      document.body.addEventListener("keydown", onKeyDown);
      cleanup(() => {
        document.body.removeEventListener("click", listen);
        document.body.removeEventListener("keydown", onKeyDown);
      });
    });
  
    return (
      <>
        <div
          tabIndex={0}
          role="button"
          onClick$={toggleShow}
          class={[
            "flex max-w-md items-center relative min-h-fit border outline-none rounded-md p-2 gap-2 focus:border-sky-500 text-right ",
          ]}
        >
          <svg
            onClick$={props.clear}
            xmlns="http://www.w3.org/2000/svg"
            class={["min-w-fit max-h-fit  w-5 h-5 fill-pink-600"]}
            viewBox="0 0 256 256"
          >
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
          </svg>
          <div class={["flex-grow gap-1 flex flex-wrap"]}>
            {props.options.map((item, index) => {
              if (!item.selected) return;
              return (
                <div
                  key={index}
                  class={[
                    "flex place-items-center gap-2 px-2 py-2 rounded-full bg-sky-100 text-sky-900",
                  ]}
                >
                  <div class={"p-1 bg-white rounded-full"}>
                    <svg
                      onClick$={props.clearOne}
                      data-value={item.value}
                      xmlns="http://www.w3.org/2000/svg"
                      class={[
                        "min-w-fit max-h-fit bg-transparent w-3 h-3 fill-pink-950",
                      ]}
                      viewBox="0 0 256 256"
                    >
                      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                  </div>
                  <span class={[""]}>{item.label}</span>
                </div>
              );
            })}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class={["min-w-fit max-h-fit w-5 h-5 fill-sky-700"]}
            viewBox="0 0 256 256"
          >
            <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path>
          </svg>
          {isShow.value ? (
            <ul
              ref={ulRef}
              class={[
                "divider",
                "m-0 p-0 absolute list-none max-h-56 overflow-y-auto border border-sky-300 rounded-lg w-full left-0 top-full translate-y-2 z-50 bg-white",
                "block",
              ]}
            >
              <li class={"p-1 sticky min-h-fit top-0 bg-white z-50"}>
                <input
                  ref={searchRef}
                  onInput$={onSearchInput}
                  onClick$={stopPropagation}
                  type="text"
                  value={searchQuery.value}
                  class={[
                    "w-full rounded-md p-2 border border-sky-300 focus-visible:outline-sky-400",
                    "",
                  ]}
                />
              </li>
              {exactMatch.value ? <></> : <li class={"bg-sky-800 p-2 m-1 rounded-md text-sky-50 font-bold"}>
                <button onClick$={onClickCreateNewOption}>צור: {searchQuery.value}</button>
              </li>}
              {computeSearch.value.map((item, index) => {
                return (
                  <>
                    <li
                      key={index}
                      onClick$={props.add}
                      onMouseEnter$={onMouseEnterHover(index)}
                      data-value={item.value}
                      class={[
                        "py-1 px-2 cursor-pointer",
                        "",
                        {
                          "bg-sky-700 text-white":
                            isKeyBoardHover.value === index,
                        },
                        {
                          "bg-sky-100":
                            item.selected && isKeyBoardHover.value !== index,
                        },
                      ]}
                    >
                      {item.label}
                    </li>
                  </>
                );
              })}
            </ul>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  });
  