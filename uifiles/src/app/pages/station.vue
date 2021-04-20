<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-domain v-model="search.domain_id" size="small" class="cell widthX150"   placeholder="易停区域"></my-select-domain>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-select v-model="search.status" size="small" class="cell widthX120"  clearable placeholder="停车场状态">
                        <el-option v-for='(val,key) in status_map' :label='val' :key='key' :value='key' />
                    </el-select>
                    <el-select v-model="search.online" size="small" class="cell widthX100"  clearable placeholder="是否在线">
                        <el-option label="是" value="1"></el-option>
                        <el-option label="否" value="0"></el-option>
                    </el-select>
                    <el-select v-model="search.recent" size="small" class="cell widthX100"  clearable>
                        <el-option label="最近两小时" value="twohour"></el-option>
                    </el-select>
                    <el-select v-model="search.local_vendor" placeholder="设备设备商" class="widthX120"  size="small" clearable>
                        <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button v-if="authCheck('停车场添加')" @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept" type='2'></my-linkage-dept>
                <el-input v-model="search.city.alias" size="small" class="cell widthX100"  @focus="SelectCityShow" trigger-on-focus=false suffix-icon="el-icon-more" placeholder="城市"></el-input>
                <my-select-cities v-if="select.city.loading" :hot=true :dept=2 @change="SelectCityChang" @close="SelectCityClose" :style="{left:'243px'}"></my-select-cities>
                <select-property v-model="search.property_id" size="small"  class="cell widthX150"  placeholder="物业公司名称"></select-property>
                <my-select-vendor v-model="search.vendor" size="small" class="cell widthX120"  placeholder="平台供应商"></my-select-vendor>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand" label-width="140px">
                                <el-form-item label="名称:"><span>{{ props.row.name }}</span></el-form-item>
                                <el-form-item label="别名:"><span>{{ props.row.alias }}</span></el-form-item>
                                <el-form-item label="地址:"><span>{{ props.row.address }}</span></el-form-item>
                                <!-- <el-form-item label="公司:"><span>{{ props.row.company_name }}</span></el-form-item> -->
                                <el-form-item label="当前月卡数:"><span>{{ props.row.contractCount }}</span></el-form-item>
                                <el-form-item label="经纬度:"><i class="fa fa-map-marker map-marker-icon" @click="showGeolocation(props.row)"></i><span>{{props.row.longitude}} , {{props.row.latitude}}</span></el-form-item>
                                <el-form-item label="小区uuid:"><span>{{props.row.uuid}}</span></el-form-item>
                                <el-form-item label="商户uuid:"><span>{{props.row.baccount}}</span></el-form-item>
                                <el-form-item label="双乾商户appid:"><span>{{props.row.sqaccount}}</span></el-form-item>
                                <el-form-item label="EAS:"><span>{{props.row.EAS}}</span></el-form-item>
                                <el-form-item label="平台供应商:"><span>{{props.row.vendor_name}}</span></el-form-item>
                                <el-form-item label="是否盈利:"><span>
                                        {{props.row.is_profit==='Y'?'盈利':(props.row.is_profit==='N'?'没有盈利':'没有数据统计')}}
                                    </span></el-form-item>
                                <el-form-item label="支持扫码支付:"><span>
                                        {{props.row.qr_pay==='Y'?'是':'否'}}</span>
                                </el-form-item>
                                <el-form-item label="是否支持推送到收费系统:"><span>
                                        {{props.row.is_push_charging==='Y'?'是':'否'}}</span>
                                </el-form-item>    
                                <el-form-item label="是否临停确认放行:">
                                    <span>{{props.row.details?(props.row.details.is_allow==='Y'?'是':'否'):''}}</span>
                                </el-form-item>
                                <el-form-item label="是否月卡车辆认证:">
                                    <span>{{props.row.details?(props.row.details.is_attestation==='Y'?'是':'否'):''}}</span>
                                </el-form-item>    
                            </el-form>
                            <div class="box_btn">
                                <el-button v-if="authCheck('月卡列表导出')" @hover="contractexport(props.row.id,props.row.popperShow)" plain size="mini" v-popover:popover5>月卡导出
                                    <el-popover ref="popover5" placement="top" width="160" v-model="props.row.popperShow" trigger="hover">
                                        <p style="marginBottom: 10px">添加月卡导出成功</p>
                                        <div style="text-align: right; margin: 0">
                                            <!-- <el-button size="mini" type="text" @click="popperShow = false">取消</el-button> -->
                                            <el-button size="mini" @click="toNform(props.row.id)">运营格式</el-button>
                                            <el-button size="mini" @click="toFform(props.row.id)">财务格式</el-button>
                                        </div>
                                    </el-popover>
                                </el-button>
                                <el-button v-if="authCheck('月卡比对')" @click="cardListsShow1(props.row.id)" plain size="mini">厂家上报月卡</el-button>
                                <el-button v-if="authCheck('月卡比对')" @click="cardListsShow(props.row.id)" plain size="mini">月卡比对</el-button>
                                <el-button v-if="authCheck('月卡推送消息')" @click="pushMsg(props.row)" plain size="mini">月卡推送消息</el-button>
                                <el-button v-if="authCheck('查看case日志')" @click="showStation(props.row)" plain size="mini">停车场CASE</el-button>
                                <el-button v-if="authCheck('黑名单列表查看')" @click="ToBlackList(props.row)" plain size="mini">黑白名单</el-button>
                                <el-button v-if="authCheck('设备列表查看')" @click="ToDeviceList(props.row)" plain size="mini"><i class="fa fa-microchip"></i>设备</el-button>
                                <el-button v-if="authCheck('月卡规则查看')" @click="ToContractRuleList(props.row)" plain size="mini"><i class="fa fa-life-ring"></i>规则</el-button>
                                <el-button v-if="authCheck('云平台')" @click="vendorCloud(props.row)" plain size="mini"><i class="fa fa-life-ring"></i>云平台</el-button>
                                <el-button v-if="authCheck('停车场所有月卡可否续费')" @click="canPayWithApp(props.row)" plain size="mini"><i class="fa fa-exclamation-triangle"></i>是否允许线上缴费</el-button>
                                <el-button v-if="authCheck('强制锁车状态修改')" @click="isForcibleLock(props.row)" plain size="mini"><i class="fa fa-exclamation-triangle"></i>{{props.row.forcedLocking?'解除':''}}强制锁车</el-button>
                                <el-button v-if="authCheck('强制锁车状态修改')" @click="setUnlock4Station(props.row)" plain size="mini"><i class="fa fa-exclamation-triangle"></i>立刻全场解锁</el-button>
                                <el-button v-if="authCheck('天眼查看')" @click="hrefDevicelLists(props.row)" plain size="mini">天眼查看</el-button>
                                <el-button v-if="authCheck('车场4G查看')" @click="ToListFor4G(props.row)" plain size="mini">车场4G查看</el-button>
                                <el-button v-if="authCheck('物料下载')" @click="ToQrEntrance(props.row)" plain size="mini">物料下载</el-button>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID" width="60"></el-table-column>
                    <el-table-column label="在线" width="60">
                        <template slot-scope="scope">
                            <i class="fa fa-star red" v-if="scope.row.alive"></i>
                            <i class="fa fa-star-o" v-else></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名称" width="150"></el-table-column>
                    <el-table-column prop="total" label="车位数" width="70"></el-table-column>
                    <el-table-column label="状态" width="70">
                        <template slot-scope="scope">
                            {{status_map[scope.row.status]||'未知'}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="local_vendor_name" label="本地供应商" width="90"></el-table-column>
                    <el-table-column prop="area_name" label="大区" width="120"></el-table-column>
                    <el-table-column prop="dept_name" label="事业部" width="120"></el-table-column>
                    <el-table-column prop="city_name" label="城市" min-width="86"></el-table-column>
                    <el-table-column label="操作" width="320">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('停车场编辑')" @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                            <el-button @click="ToMonthCard(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>月卡</el-button>
                            <el-button @click="inlists(scope.row)" plain size="mini"><i class="fa fa-download"></i>进场</el-button>
                            <el-button @click="outlists(scope.row)" plain size="mini"><i class="fa fa-upload"></i>出场</el-button>
                            <el-button @click="extlists(scope.row)" plain size="mini"><i class="fa fa-exclamation-triangle"></i>异常</el-button>
                            <el-button @click="remarks(scope.row)" plain size="mini"><i class="el-icon-document"></i>备注</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="cardWnd.title" width='80%' :visible.sync="cardWnd.show">
                <div class="clearfix">
                    <div class="left">
                        <span v-for="(k,i) in cardWnd.detail" :key="i" class="clearfix">月卡：{{k.kind}} 数量:{{k.total}}</span>
                    </div>
                    <div class="right">
                        <el-button @click="getFilterData('1')" plain size="mini">厂家有效期大于易停</el-button>
                        <el-button @click="getFilterData('-1')" plain size="mini">厂家有效期小于易停</el-button>
                        <el-button @click="getFilterData(0)" plain size="mini">全部</el-button>
                        <el-button @click="cardlists_export" plain size="mini">导出</el-button>
                    </div>
                </div>
                <el-table v-loading="cardWnd.shade" element-loading-text="拼命加载中" :data="cardWnd.lists" border fit>
                    <el-table-column type="index" width="40"></el-table-column>
                    <el-table-column prop="plate" label="车牌"></el-table-column>
                    <el-table-column prop="begin" label="本地开始时间"></el-table-column>
                    <el-table-column prop="end" label="本地结束时间"></el-table-column>
                    <el-table-column prop="rule" label="本地规则"></el-table-column>
                    <el-table-column prop="et_begin" label="易停开始时间"></el-table-column>
                    <el-table-column prop="et_end" label="易停结束时间">
                        <template slot-scope="scope">
                            <div v-html="etendFmt(scope.row.end,scope.row.et_end)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="et_rule" label="易停规则"></el-table-column>
                    <el-table-column prop="" label="操作">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('月卡删除')" @click="delClick(scope.row,scope.$index,'del')" plain size="mini"><i class="fa fa-trash-o"></i> <span :class="{'red':scope.row.isdel}">{{scope.row.isdel?'已删除':'删除'}}</span></el-button>
                            <el-button v-if="authCheck('月卡重发')" @click="sendClick(scope.row,scope.$index,'resend')" plain size="mini"><i class="fa fa-send"></i> 重发</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="140px">
                    <el-form-item label="停车场:">
                        <el-input v-model="editInfo.name" :disabled='stationDisabled' placeholder="停车场"></el-input>
                    </el-form-item>
                    <el-form-item label="云平台设备商:">
                        <el-select v-model="editInfo.vendor" placeholder="云平台设备商" class="widthP100">
                            <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="本地设备商:">
                        <el-select v-model="editInfo.local_vendor" placeholder="本地设备商" class="widthP100">
                            <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="改造年份:">
                        <el-input v-model="editInfo.time_yy" placeholder="改造年份"></el-input>
                    </el-form-item>
                    <el-form-item label="改造月份:">
                        <el-input v-model="editInfo.time_mm" placeholder="改造月份"></el-input>
                    </el-form-item>
                    <el-form-item label="改造设备套数:">
                        <el-input v-model="editInfo.devices" placeholder="改造设备套数"></el-input>
                    </el-form-item>
                    <el-form-item label="车位数:">
                        <el-input v-model="editInfo.total" placeholder="车位数"></el-input>
                    </el-form-item>
                    <el-form-item label="最大月卡数:">
                        <el-input v-model="editInfo.members" placeholder="最大月卡数"></el-input>
                    </el-form-item>
                    <el-form-item label="管理人员OA:">
                        <el-input v-model="editInfo.admin" placeholder="管理人员OA"></el-input>
                    </el-form-item>
                    <el-form-item label="维修人员OA:">
                        <el-input v-model="editInfo.maintain" placeholder="维修人员OA"></el-input>
                    </el-form-item>
                    <el-form-item label="省份:">
                        <el-select v-model="editInfo.province" placeholder="请选择省份" class="widthP100" @change='getCitiesByProvinceId'>
                            <el-option v-for="k in provincesData" :key="k.value" :label="k.name" :value="k.value">{{k.name}}</el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="城市:">
                        <el-select v-model="editInfo.city" placeholder="请选择城市" class="widthP100" v-loading='cityloading'>
                            <el-option v-for="k in citiesData" :key="k.value" :label="k.name" :value="k.value">{{k.name}}</el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="地址:">
                        <el-input v-model="editInfo.address" placeholder="地址"></el-input>
                    </el-form-item>
                    <el-form-item label="所属事业部:">
                        <el-input v-model="editInfo.dept.name" size="small" class="cell widthP100"  @focus="dailogSelectDeptShow" trigger-on-focus=false suffix-icon="el-icon-more" placeholder="请选择所属事业部"></el-input>
                        <my-select-department v-if="deptloading" @change="dailogSelectDeptChang" @close="dailogSelectDeptClose" ></my-select-department>
                    </el-form-item>
                    <el-form-item label="UUID:">
                        <el-input v-model="editInfo.uuid" placeholder="UUID" :disabled='uuidDisabled'></el-input>
                    </el-form-item>
                    <el-form-item label="双乾商户appid:">
                        <el-input v-model="editInfo.sqaccount" placeholder="双乾商户appid" :disabled="action === 'edit'"></el-input>
                    </el-form-item>
                    <el-form-item label="经度:">
                        <el-input v-model="editInfo.longitude" placeholder="经度"></el-input>
                    </el-form-item>
                    <el-form-item label="纬度:">
                        <el-input v-model="editInfo.latitude" placeholder="纬度"></el-input>
                    </el-form-item>
                    <el-form-item label="EAS:">
                        <el-input v-model="editInfo.eas" placeholder="EAS"></el-input>
                    </el-form-item>
                    <el-form-item label="允许跨月续费:">
                        <el-radio-group v-model="editInfo.month_pay_kind">
                            <el-radio :label='1'>是</el-radio>
                            <el-radio :label='0'>否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="类型:">
                        <el-radio-group v-model="editInfo.type">
                            <el-radio :label='0'>正常</el-radio>
                            <el-radio :label='1'>内场</el-radio>
                            <el-radio :label='2'>蓝牙锁</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="收费方式:">
                        <el-select v-model="editInfo.charge_rule" size="small" class="widthP100" placeholder="收费方式">
                            <el-option v-for='(val,key) in charge_map' :label='val' :key='key' :value='key' />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="当前状态:">
                        <el-select v-model="editInfo.status" size="small" class="widthP100" placeholder="状态">
                            <el-option v-for='(val,key) in status_map' :label='val' :key='key' :value='key' />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="物业公司:">
                        <el-select ref="propertySelected" v-model="property_id" size="small" class="widthP100" filterable placeholder="物业公司">
                            <el-option v-for="item in propertyCompany" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="停车场属性:">
                        <el-checkbox-group v-model="stationProperties" class="station-property">
                            <el-checkbox v-for="(item,index) in stationPropertyConfig" :key="item.key" :label="item.value" v-if="index < 2"></el-checkbox>
                            <div></div>
                            <el-checkbox v-for="(item,index) in stationPropertyConfig" :key="item.key" :label="item.value" v-if="index >= 2"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="预约进场:">
                        <el-radio-group v-model="editInfo.authorize_check">
                            <el-radio  :label="'N'">系统审核</el-radio>
                            <el-radio  :label="'Y'">人工审核</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="彩惠抵扣金使用:">
                        <el-checkbox-group v-model="editInfo.deduction">
                            <el-checkbox v-for="item in deductions" :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="是否支持扫码支付:">
                        <el-radio-group v-model="editInfo.qr_pay">
                            <el-radio :label="'Y'">是</el-radio>
                            <el-radio :label="'N'">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="临停确认进场:">
                        <el-radio-group v-model="editInfo.is_allow">
                            <el-radio label="Y">是</el-radio>
                            <el-radio label="N">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="是否月卡车辆认证:">
                        <el-radio-group v-model="editInfo.is_attestation">
                            <el-radio label="Y">是</el-radio>
                            <el-radio label="N">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="支持是否推送到收费系统:">
                        <el-radio-group v-model="editInfo.is_push_charging">
                            <el-radio :label="'Y'">是</el-radio>
                            <el-radio :label="'N'">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="支付方式:" class="pay-way">
                        <div class="pay-way-item">
                            <div class="pay-way-title">彩支付:</div>
                            <el-checkbox-group v-model="editInfo.pay_channel">    
                                <el-checkbox v-for="item in payWay1" :value='item.value' :label="item.value" :key="item.value" >{{item.name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="pay-way-item">
                            <div class="pay-way-title">ipos:</div>
                            <el-checkbox-group v-model="editInfo.pay_channel">    
                                <el-checkbox v-for="item in payWay2" :value='item.value' :label="item.value" :key="item.value" >{{item.name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="pay-way-item">
                            <div class="pay-way-title">EP微信:</div>
                            <el-checkbox-group v-model="editInfo.pay_channel">    
                                <el-checkbox v-for="item in payWay3" :value='item.value' :label="item.value" :key="item.value" >{{item.name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="pay-way-item">
                            <div class="pay-way-title">EP支付宝:</div>
                            <el-checkbox-group v-model="editInfo.pay_channel">    
                                <el-checkbox v-for="item in payWay4" :value='item.value' :label="item.value" :key="item.value" >{{item.name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </el-form-item>
                    <el-form-item label="自动推送消息渠道:">
                        <el-checkbox-group v-model="auto_push_channel">
                            <el-checkbox v-for="item in autoPush" :value='item.key' :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading="saveloading">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :visible.sync="appPayVisible.show" title='提示' width='40%'>
                <div>当前续费状态:<span v-loading='appPayVisible.statusLoading'>{{appPayVisible.status}}</span></div>
                <div>是否允许线上缴费?</div>
                <div class='defineBtn'>
                    <el-button @click="setPayStatus(id4PayStatus,1)" type="primary" size="small">同意</el-button>
                    <el-button @click="setPayStatus(id4PayStatus,0)" plain size="small">拒绝</el-button>
                </div>
            </el-dialog>
            <!-- CASE日志 S -->
            <el-dialog :title="opHistory.title" :visible.sync="opHistory.show" width='80%' @close="caseLogClose">
                <station-case-log v-if="opHistory.contentShow" :stationInfo="opHistory.stationInfo" :payChannel="pay_channel_arr"></station-case-log>
            </el-dialog>
            <!-- CASE日志 E -->
            <!-- 车场地理位置 S -->
            <el-dialog :title="station_map.title" :visible.sync="station_map.show" width='60%' @close = 'unloadAmap'>
                <div id="station_map_container"></div>
            </el-dialog>
            <!-- 车场地理位置 E -->
            <!-- 月卡到期推送 S -->
            <el-dialog :title="pushInfo.title" width='40%' :visible.sync="pushInfo.show">
                <el-form :model="pushInfo.info" v-loading='pushInfo.loading' label-width="160px">
                    <el-form-item label="过期选择:" >
                        <el-select v-model="pushInfo.info.type" size="small" class="cell widthX200"   placeholder="类型">
                            <el-option value="Y" label="即将过期"></el-option>
                            <el-option value="N" label="已经过期"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="过期时间:" >
                        <el-select v-model="pushInfo.info.range" size="small" class="cell widthX200"   placeholder="类型">
                            <el-option value="7" label="一周内"></el-option>
                            <el-option value="15" label="半月内"></el-option>
                            <el-option value="30" label="一月内"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车场名字:" v-show='false'>
                        <el-input v-model="pushInfo.info.station_name"></el-input>
                    </el-form-item>
                    <el-form-item label="短信推送彩之云广告:">
                        <el-switch v-model="pushInfo.info.pushAD" 
                            active-value="Y"  
                            inactive-value="N">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="推送渠道:">
                        <el-checkbox-group v-model="pushInfo.info.channel">
                            <el-checkbox v-for="item in pushChannel" :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="pushsubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 月卡到期推送 E -->
            <!-- 备注 S-->
            <el-dialog ref="remarkDialog" :title="remarkInfo.title" width='60%' :visible.sync="remarkInfo.show" @close="remarkClose">
                <station-remark :stationInfo="remarkInfo.stationInfo" v-if="remarkShow" ></station-remark>
            </el-dialog>
            <!-- 备注 E-->
        </div>
    </div>
</template>
<script>
import utils from "../../utils/utils.js";
import selectProperty from "../../utils/select-property.vue";
import stationRemark from "../bussiness/stationRemark.vue";
import stationCaseLog from "../bussiness/stationCaseLog.vue";
import config from '../../utils/const.js';
export default {
    data: function () {
        let deductions = [{name:'月卡',value:'month'},{name:'临停',value:'temp'}]
        return {
            remarkShow:false,
            shade: false,
            updateVisible: false,
            disableStatus: false,
            appPayVisible: { show: false, status: "", statusLoading: false },
            stationDisabled: false,
            updateTitle: "",
            deductions:deductions,
            editInfo: {
                name: "",
                vendor: "",
                local_vendor: "",
                year: "",
                month: "",
                devices: "",
                total: "",
                members: "",
                admin: "",
                maintain: "",
                province: "",
                city: "",
                address: "",
                dept: {},
                status: "",
                time_yy: "",
                time_mm: "",
                station_id: "",
                eas: "",
                month_pay_kind: "",
                authorize_check:"N",
                type: "",
                sqaccount: "",
                charge_rule: "",
                qr_pay: "N",
                is_push_charging:'N',
                paymethods: [],
                pay_channel: [],
                deduction:[],
                is_allow:"N",
                is_attestation:"N"
            },
            auto_push_channel:[],
            stationProperties: [],
            stationPropertyConfig: [],
            propertyInfo: {},
            select: {
                city: { loading: false }
            },
            cityloading: false,
            deptloading: false,
            search: {
                station: "",
                vendor: "",
                city: {
                    alias: ""
                },
                dept: {},
                status: "",
                online: "",
                recent: "",
                local_vendor: "",
                domain_id: "",
                property_id: ""
            },
            search_more: false,
            cardWnd: {
                show: false,
                shade: false,
                title: "",
                detail: "",
                bid: "",
                lists: []
            },
            pushChannel:[
                {
                    key:'czy',
                    value:'彩之云'
                },
                {
                    key:'new_czy',
                    value:'新版彩之云'
                },
                {
                    key:'sms',
                    value:'短信'
                },
                {
                    key:'wechat',
                    value:'微信'
                }
            ],
            autoPush:[
                {
                    key:'new_czy',
                    value:'新版彩之云'
                },
                {
                    key:'sms',
                    value:'短信'
                },
                {
                    key:'new_sms',
                    value:'短信（带广告）'
                },
                {
                    key:'wechat',
                    value:'微信'
                }
            ],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            vendorData: [],
            tableData: [],
            deptData: [],
            provincesData: [],
            citiesData: [],
            oldCity: "",
            oldProvice: "",
            filterDataArray: [],
            id4PayStatus: "",
            uuidDisabled: false,
            index: "",
            bid: "",
            opHistory: {
                title: "",
                show: false,
                stationInfo: {},
                contentShow: false
            },
            hasCase: false,
            pushInfo: {
                title: "",
                show: false,
                loading: false,
                info: { type: "", range: "", station_name: "",pushAD:"Y",channel:[] },
                id: ""
            },
            remarkInfo: {
                title: "",
                show: false,
                stationInfo: {}
            },
            popperShow: false,
            saveloading: false,
            paramsData: "",
            status_map: config.statusMap,
            charge_map: {
                times: "按次收费",
                rate: "按时收费",
                period: "按时段收费",
                duration: "按梯次收费"
            },
            // channels:{"双乾支付":'czy',"懿轩支付":'yx'},
            pay_channel_arr: [],
            action: "add",
            propertyCompany: [],
            property_id: "",
            oldProperty: "",
            payWay1:[],
            payWay2:[],
            payWay3:[],
            payWay4:[],
            station_map:{title:'车场地理位置',show:false}
        };
        
    },
    components: {
        "station-remark": stationRemark,
        "select-property": selectProperty,
        "station-case-log": stationCaseLog
    },
    created() {
        this.stationPropertyConfig = utils.config.stationProperty;
    },
    methods: {
        showGeolocation(row){
            let vm = this;
            vm.station_map.title = `车场地理位置(${row.name})`;
            vm.station_map.show = true;
            vm.loadAmap(row);
        },
        addMarker(map,row){
            map.setZoomAndCenter(13, [row.longitude, row.latitude]);
            var marker = new AMap.Marker({
                position: new AMap.LngLat(row.longitude, row.latitude),
                title: row.name
            });
            map.add(marker);
        },
        loadAmap(row) {
            let vm = this;
            window.onLoad = function() {
                let map = new AMap.Map('station_map_container');
                vm.addMarker(map,row)
            }
            var url = 'https://webapi.amap.com/maps?v=1.4.12&key=59ded1ab181ee9844441354b2d757990&callback=onLoad';
            var jsapi = document.createElement('script');
            jsapi.charset = 'utf-8';
            jsapi.src = url;
            jsapi.id = 'pulgin_amap_station';
            document.head.appendChild(jsapi);
        },
        unloadAmap() {
            let amap = document.getElementById('pulgin_amap_station');
            amap && amap.parentNode.removeChild(amap)
        },
        btnMore: function () {
            this.search_more = !this.search_more;
        },
        toNform: function (bid) {
            var vm = this;
            var user_id = vm.$store.state.global.login.data.user_id;
            utils
                .fetch(
                    "/contract/export?station_id=" +
                    bid +
                    "&user_id=" +
                    user_id +
                    "&type=O"
                )
                .then(function (json) {
                    if (0 == json.code) {
                        console.log(json);
                    } else {
                        vm.$message({
                            showClose: true,
                            message: json.message,
                            type: "error"
                        });
                    }
                });
            vm.$router.push({
                name: "导出",
                path: "/report/formexport",
                params: { station_id: bid }
            });
        },
        toFform: function (bid) {
            var vm = this;
            var user_id = vm.$store.state.global.login.data.user_id;
            utils
                .fetch(
                    "/contract/export?station_id=" +
                    bid +
                    "&user_id=" +
                    user_id +
                    "&type=F"
                )
                .then(function (json) {
                    if (0 == json.code) {
                        console.log(json);
                    } else {
                        vm.$message({
                            showClose: true,
                            message: json.message,
                            type: "error"
                        });
                    }
                });
            vm.$router.push({
                name: "导出",
                path: "/report/formexport",
                params: { station_id: bid }
            });
        },
        pushMsg: function (row) {
            var vm = this;
            vm.pushInfo.show = true;
            vm.pushInfo.title = "月卡推送设置";
            vm.pushInfo.id = row.id;
            vm.pushInfo.info = { type: "Y", range: "7", station_name: row.name,pushAD:'Y',channel:[] }; //打开弹窗设置默认值
        },
        pushsubmit: function () {
            var vm = this;
            var url = "/station/sendMessage";
            var data = {
                station_id: vm.pushInfo.id,
                days: vm.pushInfo.info.range,
                type: vm.pushInfo.info.type,
                station_name: vm.pushInfo.info.station_name,
                push_ad:vm.pushInfo.info.pushAD,
                channel:vm.pushInfo.info.channel.length > 0?vm.pushInfo.info.channel.join(','):''
            };
            vm.pushInfo.loading = true;
            utils.fetch(url, { method: "post", body: data }).then(function (res) {
                if(typeof res != "undefined"){
                    if (res.code == 0) {
                        vm.pushInfo.loading = false;
                        vm.pushInfo.show = false;
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "success"
                        });
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                        vm.pushInfo.loading = false;
                    }
                }
            });
        },
        delClick: function (row, index, op) {
            //删除
            var vm = this;
            var url =
                "/contract/delcard?station_id=" +
                vm.bid +
                "&car_id=" +
                row.et_carid +
                "&rule_id=" +
                row.et_ruleid;
            vm.delAndSend(url, index, op);
        },
        sendClick: function (row, index, op) {
            //重发
            var vm = this;
            var url =
                "/contract/commond?cmd=add&station_id=" +
                vm.bid +
                "&car_id=" +
                row.et_carid +
                "&rule_id=" +
                row.et_ruleid;
            vm.delAndSend(url, index, op);
        },
        delAndSend: function (url, index, op) {
            var vm = this;
            return utils.fetch(url).then(function (json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.cardWnd.lists[index].isdel = !!(op == "del");
                        vm.$message({
                            showClose: true,
                            message: json.message,
                            type: "success"
                        });
                    } else {
                        vm.$message({
                            showClose: true,
                            message: json.message,
                            type: "error"
                        });
                    }
                }
            });
        },
        showStation: function (row) {
            var vm = this;
            vm.opHistory.title = "停车场CASE记录";
            vm.opHistory.show = true;
            vm.opHistory.contentShow = true;
            vm.opHistory.stationInfo = row;
        },
        canPayWithApp: function (row) {
            var vm = this;
            var url = "/station/getVisible?station_id=" + row.id;
            vm.appPayVisible.show = true;
            vm.id4PayStatus = row.id;
            vm.appPayVisible.statusLoading = true;
            utils.fetch(url).then(function (res) {
                if (typeof res != "undefined" && res.code == 0) {
                    vm.appPayVisible.status = res.content.status;
                    vm.appPayVisible.statusLoading = false;
                }
            });
        },
        setPayStatus: function (id, n) {
            var vm = this;
            var visible = n ? "Y" : "N";
            var url = "/station/setVisible?station_id=" + id + "&visible=" + visible;
            vm.getMsg(url);
            vm.appPayVisible.show = false;
        },
        isForcibleLock: function (row) {
            console.log(row);
            var vm = this;
            var h = this.$createElement;
            var lockStr1 = row.forcedLocking ? "" : "解除";
            var lockStr2 = !row.forcedLocking ? "" : "解除";
            vm.$msgbox({
                title: "提示",
                message: h("p", { style: "line-height: 200%" }, [
                    h("div", null, "当前状态:" + lockStr1 + "强制锁车!"),
                    h("div", null, "是否要" + lockStr2 + "强制锁车?")
                ]),
                showCancelButton: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: function (action, instance, done) {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = "正在改变状态...";
                        vm.setForcibleLock(row);
                        instance.confirmButtonLoading = false;
                        done();
                    } else {
                        done();
                    }
                }
            });
        },
        setForcibleLock: function (row) {
            var vm = this;
            var lockstr = !row.forcedLocking ? "lock" : "nolock";
            var url =
                "/station/forcedLocking?station_id=" + row.id + "&status=" + lockstr;
            vm.getMsg(url);
        },
        setUnlock4Station: function (row) {
            var vm = this;
            var url = "/car/stationUnlock?station_id=" + row.id;
            vm.getMsg(url);
        },
        getMsg: function (url) {
            var vm = this;
            return utils.fetch(url).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "success"
                        });
                        vm.getData();
                    } else {
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                }
            });
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getFilterData: function (val) {
            //厂家有效期和易停有效期对比 过滤
            //('1'==val) //厂家有效期大于易停  ('-1'==val) //厂家有效期小于易停
            var vm = this;
            if (val == "-1" || val == "1") {
                vm.cardWnd.lists = vm.filterDataArray.filter(function (item) {
                    return item.filterFlag == val;
                });
            } else {
                vm.cardWnd.lists = vm.filterDataArray;
            }
        },
        getCitiesByProvinceId: function () {
            var vm = this;
            if (vm.editInfo.province != "") {
                vm.cityloading = true;
                utils
                    .fetch("/city/province?id=" + vm.editInfo.province)
                    .then(function (res) {
                        vm.citiesData =
                            typeof res != "undefined" && res.code == 0 ? res.content : [];
                        vm.editInfo.city =
                            vm.editInfo.province == vm.oldProvice ? vm.oldCity : "";
                        vm.cityloading = false;
                    });
            } else {
                vm.citiesData = [];
            }
        },
        addClick: function () {
            var vm = this;
            vm.updateVisible = true;
            vm.stationDisabled = false;
            vm.uuidDisabled = false;
            vm.saveloading = false;
            vm.updateTitle = "添加信息";
            vm.editInfo = {
                name: "",
                vendor: "",
                local_vendor: "",
                year: "",
                month: "",
                devices: "",
                total: "",
                members: "",
                admin: "",
                maintain: "",
                province: "",
                city: "",
                address: "",
                dept: {},
                eas: "",
                month_pay_kind: 0,
                authorize_check:"N",
                type: 0,
                status: "plan",
                uuid: "",
                sqaccount: "",
                longitude: "",
                latitude: "",
                charge_rule: "times",
                qr_pay: "N",
                is_push_charging:'N',
                paymethods: [],
                pay_channel: [],
                push_channel:[],
                deduction:[],
                is_allow:"N",
                is_attestation:"N"
            };
            vm.action = "add";
            vm.property_id = "";
            this.auto_push_channel = [];
            this.stationProperties = [];
            this.propertyInfo = {};
        },
        updateClick: function (row) {
            var vm = this;
            if (!!row.details && row.details.property.length > 0) {
                let oArr = [];
                for (let i = 0; i < row.details.property.length; i++) {
                    let index = vm.stationPropertyConfig.findIndex(inner => {
                        return inner.key === row.details.property[i];
                    });
                    if (index > -1) {
                        oArr.push(vm.stationPropertyConfig[index]);
                    }
                }
                let oKey = oArr.map(item => {
                    return item.value;
                });
                vm.stationProperties = oKey;
            } else {
                vm.stationProperties = [];
            }

            //根据停车场ID查询关联物业公司
            utils
                .fetch(
                    "/property/lists?station_id=" + row.id + "&page=1&pagesize=500",
                    { method: "GET" }
                )
                .then(function (json) {
                    if (typeof json != "undefined" && json.code == 0) {
                        if (!!json.content && json.content.lists.length > 0) {
                            vm.oldProperty = json.content.lists[0];
                        }
                        vm.updateVisible = true;
                        vm.stationDisabled = true;
                        vm.uuidDisabled = true;
                        vm.updateTitle = "编辑信息";
                        vm.action = "edit";
                        let {id,vendor,local_vendor,time_yy,time_mm,devices,total,members,admin,name,maintain,city,status,address,province,uuid,sqaccount,latitude,longitude,month_pay_kind,type,qr_pay,is_push_charging,EAS:eas,charge_rule,paymethods,pay_channel} = row;
                        let authorize_check='';
                        if(row.details){authorize_check=row.details.authorize_check;is_push_charging=row.details.is_push_charging;}
                        vm.editInfo = {id,vendor,local_vendor,time_yy,time_mm,devices,total,members,admin,name,maintain,city,status,address,province,uuid,sqaccount,latitude,longitude,month_pay_kind,authorize_check,type,qr_pay,is_push_charging,eas,charge_rule,paymethods,pay_channel,deduction:[],is_allow:"N",is_attestation:"N"};
                        vm.editInfo.dept = { name: row.dept_name, value: row.dept };
                        if(!!row.details){
                            if(!!row.details.deduction){
                                vm.editInfo.deduction = row.details.deduction;
                            }
                            if(!!row.details.is_allow){
                                vm.editInfo.is_allow = row.details.is_allow;
                            }
                            if(!!row.details.is_attestation){
                                vm.editInfo.is_attestation = row.details.is_attestation;
                            }
                        }
                        vm.oldCity = row.city;
                        vm.oldProvice = row.province;
                        utils
                            .fetch("/city/province?id=" + vm.editInfo.province)
                            .then(function (res) {
                                vm.citiesData =
                                    typeof res != "undefined" && res.code == 0 ? res.content : [];
                            });

                        vm.property_id = !!row.id ? vm.oldProperty.id : "";
                    } else {
                        vm.$message({
                            showClose: true,
                            message: "加载关联物业公司失败",
                            type: "error"
                        });
                    }
                });
                if(!!row.details.push_channel){
                    vm.auto_push_channel = row.details.push_channel;
                }else{
                    vm.auto_push_channel = [];
                }
                
            //   vm.updateVisible = true;

            //   vm.updateTitle = "编辑信息";
            //   vm.action = "edit";
        },
        editSubmit: function () {
            var vm = this;
            var valiMap = {
                name: "停车场名字",
                city: "城市",
                dept: "所属事业部",
                address: "地址",
                eas: "EAS"
            };

            for (var i in valiMap) {
                if (i == "dept" ? !vm.editInfo.dept.value : vm.editInfo[i] == "") {
                    vm.$message({
                        showClose: true,
                        message: valiMap[i] + "不能为空",
                        type: "error"
                    });
                    return;
                }
            }
            if(!vm.editInfo.uuid){
                vm.$message({
                    showClose: true,
                    message: "UUID不能为空",
                    type: "error"
                });
                return;
            }
            if (vm.editInfo.longitude == "" || vm.editInfo.longitude == 0) {
                vm.$message({
                    showClose: true,
                    message: "经度不能为零或空",
                    type: "error"
                });
                return;
            }
            if (vm.editInfo.latitude == "" || vm.editInfo.latitude == 0) {
                vm.$message({
                    showClose: true,
                    message: "纬度不能为零或空",
                    type: "error"
                });
                return;
            }
            let {id,name,city,vendor,local_vendor,status,total,members,admin,maintain,uuid,sqaccount,address,latitude,longitude,eas,month_pay_kind,authorize_check,type,charge_rule,qr_pay,is_push_charging,dept: { value: dept },is_allow,is_attestation} = vm.editInfo;
            let editData = {id,name,city,vendor,local_vendor,status,total,members,admin,maintain,uuid,sqaccount,address,latitude,longitude,eas,month_pay_kind,authorize_check,type,charge_rule,qr_pay,is_push_charging,dept,is_allow,is_attestation};
            editData.paymethods = vm.editInfo.paymethods.join(",");
            editData.pay_channel = vm.editInfo.pay_channel.join(",");
            editData.push_channel = vm.auto_push_channel.join(",");
            editData.deduction = vm.editInfo.deduction.join(",");
            var url = "/station/add";
            if (vm.action == "edit") {
                editData.time_yy = vm.editInfo.time_yy;
                editData.station_id = vm.editInfo.id;
                editData.time_mm = vm.editInfo.time_mm;
                editData.devices = vm.editInfo.devices;
                url = "/station/update";
            }
            //给表单加入停车场属性，station_property
            if (vm.stationProperties.length > 0) {
                let oArr = [];
                for (let i = 0; i < vm.stationProperties.length; i++) {
                    let index = vm.stationPropertyConfig.findIndex(inner => {
                        return inner.value === vm.stationProperties[i];
                    });
                    if (index > -1) {
                        oArr.push(vm.stationPropertyConfig[index]);
                    }
                }
                let oKey = oArr.map(item => {
                    return item.key;
                });
                editData.property = oKey.join(",");
            } else {
                editData.property = "";
            }
            let selectedProperty = [];
            let updatePropertyUrl = "/property/update";
            /**
             * 保存前先保存物业公司信息
             * 最后更新停车场信息
             */

            //添加停车场
            if(url === "/station/add"){
                vm.saveloading = true;
                utils.fetch(url, { method: "POST", body: editData }).then(function (res) {
                    vm.saveloading = false;
                    if (res.code == 0 && !!res.content) {
                        //如果选择了物业公司
                        if(!!vm.property_id){
                            //如果该物业公司已经绑定了停车场信息，则添加该停车场在后面，否则将该停车场赋值
                            let stations = res.content;
                            selectedProperty = vm.propertyCompany.filter(item => {
                                return item.id === vm.property_id;
                            });
                            if(!!selectedProperty[0].station_id){
                                stations = selectedProperty[0].station_id + ',' + res.content
                            }
                            let propertyParams = {
                                id: selectedProperty[0].id,
                                station_id: stations,
                                linkman: selectedProperty[0].linkman,
                                mobile: selectedProperty[0].mobile,
                                bank_account: JSON.stringify(selectedProperty[0].bank_account),
                                name: selectedProperty[0].name,
                                abb_name: selectedProperty[0].abb_name
                            }
                            //绑定物业公司信息
                            utils.fetch(updatePropertyUrl, {method: "POST",body: propertyParams}).then(function (res) {
                                if (res.code == 0) {
                                    vm.updateVisible = false;
                                    vm.getData();
                                } else {
                                    vm.$message({
                                        showClose: true,
                                        message: res.message,
                                        type: "error"
                                    });
                                }

                            });
                        }else{
                            vm.updateVisible = false;
                            vm.getData();
                        }
                        
                    }else{
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                })
            }else if(url === "/station/update"){ // 更新停车场信息
                if (!vm.property_id) {
                    vm.$message({
                        showClose: true,
                        message: '请选择关联物业公司',
                        type: 'error'
                    })
                    vm.saveloading = false;
                    return false;
                }
                if (vm.stationProperties.length === 0) {
                    vm.$message({
                        showClose: true,
                        message: '请选择停车场属性',
                        type: 'error'
                    })
                    vm.saveloading = false;
                    return false;
                }
                selectedProperty = vm.propertyCompany.filter(item => {
                    return item.id === vm.property_id;
                });
                //先不管物业公司,先更新停车场信息
                vm.saveloading = true;
                utils.fetch(url, { method: "POST", body: editData }).then(function (res) {
                    vm.saveloading = false;
                    if (res.code === 0) {
                        //如果物业公司已经修改，则改变物业公司关联
                        if (!!vm.oldProperty.id && vm.property_id !== vm.oldProperty.id) {
                            let stations = selectedProperty[0].station_id;
                            if(!!stations){
                                stations = selectedProperty[0].station_id + "," + editData.id
                            }
                            let newData = {
                                id: selectedProperty[0].id,
                                station_id: stations,
                                linkman: selectedProperty[0].linkman,
                                mobile: selectedProperty[0].mobile,
                                bank_account: JSON.stringify(selectedProperty[0].bank_account),
                                name: selectedProperty[0].name,
                                abb_name: selectedProperty[0].abb_name
                            };
                            let oId = vm.oldProperty.station_id;
                            let oldStation = oId.split(",").filter(item => {
                                return item !== editData.id.toString();
                            });
                            let oldData = {
                                id: vm.oldProperty.id,
                                station_id: oldStation.join(","),
                                linkman: vm.oldProperty.linkman,
                                mobile: vm.oldProperty.mobile,
                                bank_account: JSON.stringify(vm.oldProperty.bank_account),
                                name: vm.oldProperty.name,
                                abb_name: vm.oldProperty.abb_name
                            };
                            utils.fetch(updatePropertyUrl, { method: "POST", body: oldData }).then(function (res) {
                                if (res.code == 0) {
                                    utils.fetch(updatePropertyUrl, { method: "POST", body: newData }).then(function (res) {
                                        if (res.code == 0) {
                                            vm.updateVisible = false;
                                            vm.getData();
                                        }else{
                                            vm.$message({
                                                showClose: true,
                                                message: res.message,
                                                type: "error"
                                            });
                                        }
                                    })
                                }else{
                                    vm.$message({
                                        showClose: true,
                                        message: res.message,
                                        type: "error"
                                    });
                                }
                            })
                        }else if(!!vm.property_id){
                            //如果该物业公司已经绑定了停车场信息，则添加该停车场在后面，否则将该停车场赋值
                            let staions = editData.id;
                            selectedProperty = vm.propertyCompany.filter(item => {
                                return item.id === vm.property_id;
                            });
                            if(!!selectedProperty[0].station_id){
                                staions = selectedProperty[0].station_id + ',' + editData.id
                            }
                            let propertyParams = {
                                id: selectedProperty[0].id,
                                station_id: staions,
                                linkman: selectedProperty[0].linkman,
                                mobile: selectedProperty[0].mobile,
                                bank_account: JSON.stringify(selectedProperty[0].bank_account),
                                name: selectedProperty[0].name,
                                abb_name: selectedProperty[0].abb_name
                            }
                            //绑定物业公司信息
                            utils.fetch(updatePropertyUrl, {method: "POST",body: propertyParams}).then(function (res) {
                                if (res.code == 0) {
                                    vm.updateVisible = false;
                                    vm.getData();
                                } else {
                                    vm.$message({
                                        showClose: true,
                                        message: res.message,
                                        type: "error"
                                    });
                                }

                            });
                        }
                    }else{
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                })
            }
        },
        getData: function () {
            var vm = this;
            var url =
                "/station/lists?page=" +
                vm.pagination.page +
                "&pagesize=" +
                vm.pagination.pagesize;
            var status_p = vm.$route.params.status;
            var online_p = vm.$route.params.online;
            // var dept_p = vm.$route.params.dept;暂时不接收其它页面传过来的值 如todolist.vue
            // if(dept_p && vm.search.dept== ''){vm.search.dept = dept_p}
            if (online_p && vm.search.online == "") {
                vm.search.online = online_p;
            }
            if (status_p && vm.search.status == "") {
                vm.search.status = status_p;
            }
            let {
                station: station_id,
                city: { value: city },
                dept,
                ...others
            } = vm.search;
            let searchmap = { station_id, city, ...others };
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? "&" + querystr : "";
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? '&' + deptStr : '';
            vm.shade = true;
            utils.fetch(url).then(function (json) {
                let tableData = (json && json.code === 0 && json.content.lists) ? json.content.lists : [];
                let result = tableData.map(item => {
                    return {
                        popperShow:false,
                        ...item
                    }
                })
                vm.tableData = result;
                vm.pagination.total = (json && json.code === 0 && json.content.total) ? json.content.total : 0;
                utils.setCache(vm);
                vm.shade = false;
            });
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = {
                station: "",
                vendor: "",
                city: {},
                dept: "",
                status: "",
                online: "",
                recent: "",
                local_vendor: "",
                domain_id: "",
                property_id: ""
            };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }
            this.getData();
        },
        SelectCityChang: function (obj) {
            this.search.city = obj;
            this.SelectCityClose();
        },
        SelectCityShow: function () {
            this.select.city.loading = this.select.city.loading ? false : true;
        },
        SelectCityClose: function () {
            this.select.city.loading = false;
        },
        dailogSelectDeptChang: function (obj) {
            this.editInfo.dept = obj;
            this.dailogSelectDeptClose();
        },
        dailogSelectDeptShow: function () {
            this.deptloading = this.deptloading ? false : true;
        },
        dailogSelectDeptClose: function () {
            this.deptloading = false;
        },
        ToMonthCard: function (obj) {
            var r = {
                name: "月卡",
                path: "/contract/lists",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        ToBlackList: function (obj) {
            var r = {
                name: "黑白名单",
                path: "/blacklist",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        ToDeviceList(obj) {
            var r = {
                name: "设备管理",
                path: "/device/lists",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        ToContractRuleList(obj) {
            var r = {
                name: "月卡规则",
                path: "/contract/rules",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        inlists: function (obj) {
            var r = {
                name: "进场记录",
                path: "/inout/inlists",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        outlists: function (obj) {
            var r = {
                name: "出场记录",
                path: "/inout/outlists",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        extlists: function (obj) {
            var r = {
                name: "异常开闸",
                path: "/inout/exception",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        remarks: function (obj) {
            this.remarkInfo.title = "备注记录";
            this.remarkInfo.stationInfo = obj;
            this.remarkInfo.show = true;
            this.remarkShow = true;
        },
        remarkClose(){
            this.remarkInfo.show = false;
            this.remarkShow = false;
        },
        caseLogClose(val) {
            this.opHistory.show = false;
            this.opHistory.contentShow = false;
        },
        // scrollRemark() {
        //     this.$refs["remarkDialog"].$el.scrollTop = 0;
        // },
        hrefDevicelLists: function (obj) {
            var r = {
                name: "设备管理",
                path: "/device/lists",
                params: { station_id: obj.id, station_name: obj.name, type: 5 }
            };
            this.$router.push(r);
        },
        ToListFor4G: function (obj) {
            var r = {
                name: "车场4G列表",
                path: "/listsfor4G",
                params: { station_id: obj.id, station_name: obj.name }
            };
            this.$router.push(r);
        },
        ToQrEntrance:function(obj){
            let params = {
                station_id:obj.id,
                station_name:obj.name,
                pay_channel:obj.pay_channel
            }
            var r = { name:'物料下载',path: '/qrentrance', params };
            this.$router.push(r);
        },
        getVendorData: function () {
            var vm = this;
            var url = "/vendor/getDatas";
            return utils.fetch(url).then(function (res) {
                vm.vendorData =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
            });
        },
        getProvinceData: function () {
            var vm = this;
            var url = "/city/province";
            utils.fetch(url).then(function (res) {
                vm.provincesData =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
            });
        },
        cardListsShow1: function (bid) {
            var vm = this;
            vm.bid = bid;
            this.$store.commit("loading", true);
            this.cardWnd = {
                show: false,
                shade: false,
                title: "",
                detail: "",
                bid: bid,
                page: 1,
                lists: []
            };
            vm.cardlists1().then(function (data) {
                if (data) vm.cardWnd.show = true;
                vm.$store.commit("loading", false);
            });
        },
        cardListsShow: function (bid) {
            var vm = this;
            vm.bid = bid;
            this.$store.commit("loading", true);
            this.cardWnd = {
                show: false,
                shade: false,
                title: "",
                detail: "",
                bid: bid,
                page: 1,
                lists: []
            };
            vm.cardlists().then(function (data) {
                if (data) vm.cardWnd.show = true;
                vm.$store.commit("loading", false);
            });
            // this.cardTotal().then(function(status){
            //     if(status == false) vm.$store.commit('loading',false);
            //     return status;
            // }).then(function(status){
            //     if(status){
            //         vm.cardlists().then(function(data){
            //             if(data) vm.cardWnd.show = true;
            //             vm.$store.commit('loading',false);
            //         });
            //     }
            // });
        },
        //厂家上报的月卡请求；
        cardlists1: function () {
            var vm = this;
            vm.cardWnd.shade = true;
            return utils
                .fetch(
                    "/contract/contractCompare?cmd=list&station_id=" +
                    vm.cardWnd.bid +
                    "&page=1&pagesize=100000"
                )
                .then(function (json) {
                    if (typeof json != "undefined") {
                        vm.cardWnd.shade = false;
                        if (json.code == 0) {
                            if (
                                typeof json.content.lists != "undefined" &&
                                json.content.lists.length > 0
                            ) {
                                vm.cardWnd.title = json.content.title;
                                vm.cardWnd.lists = json.content.lists.map(function (i) {
                                    return Object.defineProperty(i, "isdel", {
                                        value: false,
                                        writable: true,
                                        enumerable: true,
                                        configurable: true
                                    });
                                });
                                vm.filterDataArray = json.content.lists;
                                vm.setFilterFlag(vm.filterDataArray);
                                return true;
                            } else {
                                // var msg = "获取月卡列表cmd=list：" + json.content.info.result.reason + "  " + json.content.info.result.result;
                                vm.$message({
                                    showClose: true,
                                    message: "没有数据",
                                    type: "error"
                                });
                                return false;
                            }
                        } else {
                            vm.$message({
                                showClose: true,
                                message: json.message,
                                type: "error"
                            });
                            return false;
                        }
                    }
                });
        },
        cardlists: function () {
            var vm = this;
            vm.cardWnd.shade = true;
            // vm.cardWnd.lists = [];
            return utils
                .fetch(
                    "/contract/remotecards?cmd=list&station_id=" +
                    vm.cardWnd.bid +
                    "&page=1&pagesize=100000"
                )
                .then(function (json) {
                    if (typeof json != "undefined") {
                        vm.cardWnd.shade = false;
                        if (json.code == 0) {
                            if (
                                typeof json.content.lists != "undefined" &&
                                json.content.lists.length > 0
                            ) {
                                vm.cardWnd.title = json.content.title;
                                vm.cardWnd.lists = json.content.lists.map(function (i) {
                                    return Object.defineProperty(i, "isdel", {
                                        value: false,
                                        writable: true,
                                        enumerable: true,
                                        configurable: true
                                    });
                                });
                                vm.filterDataArray = json.content.lists;
                                vm.setFilterFlag(vm.filterDataArray);
                                return true;
                            } else {
                                // var msg = "获取月卡列表cmd=list：" + json.content.info.result.reason + "  " + json.content.info.result.result;
                                vm.$message({
                                    showClose: true,
                                    message: "没有数据",
                                    type: "error"
                                });
                                return false;
                            }
                        } else {
                            vm.$message({
                                showClose: true,
                                message: json.message,
                                type: "error"
                            });
                            return false;
                        }
                    }
                });
        },
        setFilterFlag: function (arr) {
            arr.map(function (item) {
                if (item.et_end == "") {
                    item.filterFlag = "0";
                    return;
                }
                var et_end = Number(item.et_end.replace(/\-|\:|\s/g, ""));
                var end = Number(item.end);
                if (et_end > end) {
                    item.filterFlag = "-1";
                } else if (et_end < end) {
                    item.filterFlag = "1";
                } else {
                    item.filterFlag = "0";
                }
            });
        },
        cardTotal: function () {
            var vm = this;
            return utils
                .fetch("/contract/commond?cmd=get&station_id=" + vm.cardWnd.bid)
                .then(function (json) {
                    if (typeof json != "undefined") {
                        if (json.code == 0) {
                            if (
                                typeof json.content.info.result.detail != "undefined" &&
                                json.content.info.result.detail.length > 0
                            ) {
                                vm.cardWnd.detail = json.content.info.result.detail;
                                return true;
                            } else {
                                var msg =
                                    "获取月卡cmd=get：" +
                                    json.content.info.result.reason +
                                    "  " +
                                    json.content.info.result.result;
                                vm.$message({ showClose: true, message: msg, type: "error" });
                                return false;
                            }
                        } else {
                            vm.$message({
                                showClose: true,
                                message: json.message,
                                type: "error"
                            });
                            return false;
                        }
                    }
                });
        },
        contractexport: function (bid,isShow) {
            var vm = this;
            isShow = !isShow;
            // var user_id = vm.$store.state.global.login.data.user_id;
            // utils.fetch("/contract/export?station_id="+bid+"&user_id="+user_id).then(function(json){
            //     if(0 == json.code){

            //         console.log(json);
            //     }else{
            //         vm.$message({ showClose:true, message:json.message, type:'error' });
            //     }
            // });
        },
        cardlists_export: function () {
            var vm = this;
            vm.$store.commit("loading", true);
            utils.rpc
                .loadfile(
                    "/contract/savevendorcard?cmd=list&page=1&pagesize=1000000&station_id=" +
                    this.cardWnd.bid
                )
                .then(function (status) {
                    vm.$store.commit("loading", false);
                });
        },
        timestamp: function (str) {
            var year = str.substr(0, 4);
            var month = str.substr(4, 2);
            var day = str.substr(6, 2);
            var hour = str.substr(8, 2);
            var min = str.substr(10, 2);
            var sec = str.substr(12, 2);
            var d =
                year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
            var t = new Date(d);
            return t.getTime();
        },
        etendFmt: function (end, et_end) {
            var et = new Date(et_end);
            if (et.getTime() > this.timestamp(end)) {
                return (
                    '<span style="color:#FF9933;font-style:italic">' + et_end + "</span>"
                );
            } else if (et.getTime() < this.timestamp(end)) {
                return (
                    '<span style="color:red;font-style:italic">' + et_end + "</span>"
                );
            } else {
                return et_end;
            }
        },
        vendorCloud: function (row) { },
        authCheck: function (tag) {
            return utils.authCheck(this, tag);
        },
        getPayChannel() {
            let vm = this;
            let url = "/station/payChannelLists";
            return utils.fetch(url).then(function (res) {
                vm.pay_channel_arr =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
                vm.payWay1 = vm.pay_channel_arr.filter(item => {
                    return item.channel === '彩支付';
                })
                vm.payWay2 = vm.pay_channel_arr.filter(item => {
                    return item.channel === 'ipos';
                })
                vm.payWay3 = vm.pay_channel_arr.filter(item => {
                    return item.channel === 'EP微信';
                })
                vm.payWay4 = vm.pay_channel_arr.filter(item => {
                    return item.channel === 'EP支付宝';
                })  
            });
        },
        getPropertyCompany() {
            utils.fetch("/property/lists?page=1&pagesize=100").then(json => {
                this.propertyCompany =
                    (json && json.code == 0 && json.content && json.content.lists && Array.isArray(json.content.lists)) ? json.content.lists : [];
            });
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            utils.getTingYunScript();
            vm.getVendorData();
            vm.getProvinceData();
            vm.getPayChannel();
            vm.getPropertyCompany();
            var hasParams = utils.hasRouteParams(vm.$route.params);
            if (hasParams) {
                vm.getData();
                return;
            }
            var data = utils.getCache();
            var obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    }
};
</script>
<style scoped>
#station_map_container{
    width: 100%;
    height: 300px;
}
.map-marker-icon{font-size: 18px; color:#1497f1;padding-right: 10px;cursor:pointer}
.el-form-item {
  margin-bottom: 12px;
}
.el-dialog__body {
  padding: 10px 20px;
}
/*.clearfix{padding: 10px;}*/
.defineBtn {
  display: flex;
  justify-content: flex-end;
}
.red {
  color: red;
}
.remark-form textarea {
  resize: none !important;
}
</style>
