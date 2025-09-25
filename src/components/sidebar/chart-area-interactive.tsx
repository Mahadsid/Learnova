"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


export const description = "An interactive area chart"

// const dummyEnrollmentData = [
//   {
//     date: '2025-09-22', enrollments: 12,
//   },
//   {
//     date: '2025-09-23', enrollments: 23,
//   },
//   {
//     date: '2025-09-24', enrollments: 15,
//   },
//   {
//     date: '2025-09-25', enrollments: 16,
//   },
//   {
//     date: '2025-09-26', enrollments: 25,
//   },
//   {
//     date: '2025-09-27', enrollments: 6,
//   },
//   {
//     date: '2025-09-28', enrollments: 23,
//   },
//   {
//     date: '2025-09-29', enrollments: 2,
//   },
//   {
//     date: '2025-09-30', enrollments: 15,
//   },
//   {
//     date: '2025-10-1', enrollments: 22,
//   },
//   {
//     date: '2025-10-2', enrollments: 14,
//   },
//   {
//     date: '2025-10-3', enrollments: 9,
//   },
//   {
//     date: '2025-10-4', enrollments: 10,
//   },
//   {
//     date: '2025-10-5', enrollments: 5,
//   },
//   {
//     date: '2025-10-6', enrollments: 32,
//   },
//   {
//     date: '2025-10-7', enrollments: 21,
//   },
//   {
//     date: '2025-10-8', enrollments: 25,
//   },
// ]

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig

interface ChartAreaInteractiveProps{
  data: {
    date: string;
    enrollments: number;
  }[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const totalEnrollmentsNumber = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.enrollments, 0), [data]
  );
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          <span className="hiddden @[540px]/card:block">Total enrollments in the last last 30 days: { totalEnrollmentsNumber }</span>
          <span className="@[540]/card:hidden">Last 30 days:{ totalEnrollmentsNumber } </span>
        </CardDescription>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={data} margin={{
              left: 12,
              right: 12,
            }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} interval={"preserveStartEnd"} tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }} />
              <ChartTooltip content={
                <ChartTooltipContent className="w-[150px]" labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}/>
              } />
              <Bar dataKey={"enrollments"} fill="var(--color-enrollments)"/>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </CardHeader>
    </Card>
  )
}
