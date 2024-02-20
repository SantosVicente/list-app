//http://localhost:3333/tags?_page=1&_per_page=5 example

import {
  Loader2,
  LucideFileDown,
  LucideFilter,
  LucideMoreHorizontal,
  LucideSearch,
  Plus,
} from "lucide-react";
import { Header } from "./components/header";
import { Tabs } from "./components/tabs";
import { Button } from "./components/ui/button";
import { Control, Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Pagination } from "./components/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FormEvent, /* useEffect ,*/ useState } from "react";
/* import useDebounceValue from "./hooks/use-debounce-value"; */

export interface TagResponse {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: Tag[];
}

export interface Tag {
  title: string;
  amountOfVideos: number;
  id: string;
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFilter = searchParams.get("filter") ?? "";

  const [filter, setFilter] = useState(urlFilter);

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  /* const debouncedFilter = useDebounceValue(filter, 1000); */

  /* useEffect(() => {
    setSearchParams((params) => {
      params.set("page", "1");

      return params;
    });
  }, [debouncedFilter, setSearchParams]); */

  const {
    data: tagsResponse,
    isLoading,
    isFetching,
  } = useQuery<TagResponse>({
    queryKey: ["get-tags", urlFilter, page],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`
      );
      const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return data;
    },
    placeholderData: keepPreviousData, // previne a tela de piscar
    //refetchOnWindowFocus: false, // desabilita o refetch quando a janela entra em foco
  });

  function handleFilter(event: FormEvent) {
    event.preventDefault();

    setSearchParams((params) => {
      params.set("page", "1");

      if (!filter) {
        params.delete("filter");
        return params;
      }

      params.set("filter", filter);
      return params;
    });
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>

      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Button variant="primary">
            <Plus className="size-3" />
            Create new
          </Button>
          {isFetching && (
            <Loader2 className="size-4 animate-spin text-zinc-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <form onSubmit={handleFilter} className="flex items-center gap-2">
            <Input variant="filter">
              <LucideSearch className="size-3" />
              <Control
                placeholder="Search tags..."
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
              />
            </Input>
            <Button type="submit">
              <LucideFilter className="size-3" />
              Apply filters
            </Button>
          </form>

          <Button>
            <LucideFileDown className="size-3" />
            Export
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Amount of Videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsResponse?.data.map((tag: Tag) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{tag.title}</span>
                      <span className="text-xs text-zinc-500 uppercase">
                        {tag.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <LucideMoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {tagsResponse && (
          <Pagination
            pages={tagsResponse.pages}
            items={tagsResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  );
}
