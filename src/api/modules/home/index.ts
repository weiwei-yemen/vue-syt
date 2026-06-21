import request from "@/api/request"
import {
  AreaInterfaceRes,
  HospitalInfoInterface,
  HospitalLevelInterfaceRes,
  HospitalListInterfaceRes
} from "@/api/modules/home/interface"

export const getPageList = (
  page: number,
  limit: number,
  searchObj: {
    hostype: string
    districtCode: string
  }
) => {
  /**
   * 1.这里最右边其实有第三个泛型参数，泛型参数从左往右填充，右边没传的用默认值
   * 2.第一个参数是AxiosResponse的data
   * 3.第二个参数是对外层返回的AxiosResponse
   * 4.第三个是请求的类型
   * 5.为什么第一个泛型传null？
   *    因为在拦截器中将AxiosResponse的data直接返回了，最外层返回的类型为AxiosResponse.data
   *    AxiosResponse的data用不上了，这里用null占位（这里用null更合适，当然非要用any也是可以的）
   */
  return request<null, HospitalListInterfaceRes>({
    url: `/api/hosp/hospital/${page}/${limit}`,
    method: "get",
    params: searchObj
  })
}
// 获取医院等级
export const findByDictCode = (dictCode: string) => {
  return request<null, HospitalLevelInterfaceRes[]>({
    url: `/api/cmn/dict/findByDictCode/${dictCode}`,
    method: "get"
  })
}
// 获取地区请求
export const getAreaList = (dictCode: string) => {
  return request<null, AreaInterfaceRes[]>({
    url: `/api/cmn/dict/findByDictCode/${dictCode}`,
    method: "get"
  })
}
// 搜索，获取医院列表
export const getByHosname = (hosname: string) => {
  return request<null, HospitalInfoInterface[]>({
    url: `/api/hosp/hospital/findByHosname/${hosname}`,
    method: "get"
  })
}
