import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import minMax from "dayjs/plugin/minMax"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// 한국 시간 기준
dayjs.tz.setDefault("Asia/Seoul")

// ✅ 여기서만 선언
export const todayKey = () => dayjs().format("YYYY-MM-DD")
export const addDays = (s, n) => dayjs(s).add(n, "day").format("YYYY-MM-DD")

export default dayjs
