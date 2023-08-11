import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDemo() {
  return (
    <>
     
      <div className="bg-slate-300 mt-2 rounded-md flex p-2 h-14">
        <div>
          <Skeleton className="rounded-full h-8 bg-slate-200 w-8 m-auto" />
        </div>
        <div className="ml-3 top-0 flex flex-col gap-2">
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-28 m-auto" />
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-20 my-auto" />
        </div>
      </div>
     
      <div className="bg-slate-300 mt-2 rounded-md flex p-2 h-14">
        <div>
          <Skeleton className="rounded-full h-8 bg-slate-200 w-8 my-auto" />
        </div>
        <div className="ml-3 top-0 flex flex-col gap-2">
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-28 m-auto" />
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-20 my-auto" />
        </div>
      </div>
     
      <div className="bg-slate-300 mt-2 rounded-md flex p-2 h-14">
        <div>
          <Skeleton className="rounded-full h-8 bg-slate-200 w-8 m-auto" />
        </div>
        <div className="ml-3 top-0 flex flex-col gap-2">
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-28 m-auto" />
          <Skeleton className="rounded-lg h-3 bg-slate-200 w-20 my-auto" />
        </div>
      </div>
    
    </>
  );
}
