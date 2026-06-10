import type { EnvelopeData } from '../types/envelope'

export const mockEnvelopeData: EnvelopeData = {
  sender: {
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    street: '中关村大街1号科技大厦 1001室',
    postcode: '100080',
    tags: [],
  },
  recipient: {
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    street: '世纪大道100号环球金融中心 28层',
    postcode: '200120',
    tags: [],
  },
}

export const mockBritishData: EnvelopeData = {
  sender: {
    name: 'John Smith',
    phone: '+44 20 7946 0958',
    province: 'England',
    city: 'London',
    district: '',
    street: '10 Downing Street',
    postcode: 'SW1A 2AA',
    tags: [],
  },
  recipient: {
    name: 'Jane Doe',
    phone: '+44 161 496 0000',
    province: 'England',
    city: 'Manchester',
    district: '',
    street: '42 Baker Street',
    postcode: 'M1 1AE',
    tags: [],
  },
}
