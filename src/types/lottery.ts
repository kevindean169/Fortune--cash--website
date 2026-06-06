export interface APILottery {
  id: number
  name: string
  type: string
  schedule: string | null
  day: string
  draw_no: number
  image: string
  status: number
  currentDraw: string
  startDate: string
  startTime: string
  stopDate: string
  stopTime: string
  startDateTime: string
  stopDateTime: string
  drawTimes: string[]
}
