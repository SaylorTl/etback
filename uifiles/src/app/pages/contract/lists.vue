<template>
    <div id="box" class="month-card menu-hide">
        <div class="worker station">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场" @input="getCurrentStationRules"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.status" size="small" class="cell widthX100" placeholder="状态" clearable>
                        <el-option label="已创建" value="created"></el-option>
                        <el-option label="使用中" value="working"></el-option>
                        <el-option label="已禁用" value="locked"></el-option>
                        <el-option label="已取消" value="canceled"></el-option>
                    </el-select>
                    <el-select v-model="search.is_expired" size="small" class="cell widthX100" placeholder="是否过期" clearable>
                        <el-option label="已过期" value="Y"></el-option>
                        <el-option label="未过期" value="N"></el-option>
                    </el-select>
                    <el-select v-model="search.rule_id" size="small" class="cell widthX100" placeholder="规则名称" clearable v-show="ruleSearch.show" v-loading="getRulesLoading">
                        <el-option v-for="item in filterRulesInStation" :key="item.id" :value="item.id" :label="item.name">
                            <span class="left">{{ item.name }}</span>
                            <span class="ruleN1">¥:{{ item.N1 }}</span>
                        </el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa', search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button v-if="authCheck('月卡添加')" @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="contractImport" size="small"><i class="fa fa-arrow-down"></i>导入</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <my-select-domain v-model.trim="search.domain_id" size="small" class="cell widthX150" placeholder="易停区域"></my-select-domain>
                <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept>
                <el-input v-model.trim="search.username" size="small" class="cell widthX100" placeholder="用户名"></el-input>
                <el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                <el-input v-model.trim="search.position" size="small" class="cell widthX120" placeholder="车位编号"></el-input>
                <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="类型">
                    <el-option label="一卡多车" value="0"></el-option>
                    <el-option label="子母车" value="1"></el-option>
                </el-select>
                <select-property v-model="search.property_id" size="small" class="cell widthX150" placeholder="物业公司名称"></select-property>
                <!-- <el-input v-model.trim="search.unit_name" placeholder="楼栋号" size="small" class="cell widthX120"></el-input> -->
            </div>
            <build-search v-show="search_more" ref="buildSearch" class="condition-more clearfix box-width" :station_id="search.station_id"></build-search>
            <!-- <div v-show="search_more" class="condition-more clearfix box-width">
                <el-input v-model.trim="search.room_name" placeholder="房间号" size="small" class="cell widthX120"></el-input>
            </div> -->
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" @expand-change="rowClick">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="月卡ID:"
                                    ><span>{{ props.row.id }}</span></el-form-item
                                >
                                <el-form-item label="月卡金额:"
                                    ><span>{{ props.row.rule_N1 }}</span></el-form-item
                                >
                                <el-form-item label="用户姓名:"
                                    ><span>{{ props.row.username }}</span></el-form-item
                                >
                                <el-form-item label="用户手机:"
                                    ><span>{{ props.row.phone }}</span></el-form-item
                                >
                                <el-form-item label="车牌:" class="from_plates">
                                    <div v-if="props.row.plates.length > 10">
                                        <div>
                                            关联车牌过多，<el-button type="primary" size="mini" plain @click="showMorePlate(props.row)"><i class="fa fa-search"></i>查看详情</el-button>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <span v-for="(k, i) in props.row.plates" class="del-plate" :key="i">
                                            <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                            <el-tag v-else type="primary">副</el-tag>
                                            {{ k.plate }}
                                            <i class="fa fa-close" @click="delPlate(k.plate, props.row)"></i>
                                        </span>
                                    </div>
                                </el-form-item>
                                <el-form-item label="车型:" class="from_plates">
                                    <div v-if="props.row.models.length > 10">
                                        <div>
                                            关联车牌过多，<el-button type="primary" size="mini" plain @click="showMorePlate(props.row)"><i class="fa fa-search"></i>查看详情</el-button>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <span v-for="(k, i) in props.row.models" :key="i">
                                            <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                            <el-tag v-else type="primary">副</el-tag>
                                            {{ k.model || "未知" }}
                                        </span>
                                    </div>
                                </el-form-item>
                                <el-form-item label="颜色:" class="from_plates">
                                    <div v-if="props.row.colours.length > 10">
                                        <div>
                                            关联车牌过多，<el-button type="primary" size="mini" plain @click="showMorePlate(props.row)"><i class="fa fa-search"></i>查看详情</el-button>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <span v-for="(k, i) in props.row.colours" :key="i">
                                            <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                            <el-tag v-else type="primary">副</el-tag>
                                            {{ k.colour || "未知" }}
                                        </span>
                                    </div>
                                </el-form-item>
                                <el-form-item label="收费规则:"
                                    ><span>{{ props.row.rule_name }}</span></el-form-item
                                >
                                <el-form-item label="锁车状态:"
                                    ><span>{{ props.row.lockStatus }}</span></el-form-item
                                >
                                <el-form-item label="类型:">
                                    <span v-if="props.row.type == 0">一卡多车</span>
                                    <span v-if="props.row.type == 1">子母车</span>
                                </el-form-item>
                                <el-form-item label="最小缴费数:"
                                    ><span>{{ props.row.rule_paymin }}</span></el-form-item
                                >
                                <el-form-item label="最大缴费数:"
                                    ><span>{{ props.row.rule_paymax }}</span></el-form-item
                                >
                                <el-form-item label="规则类型:">
                                    {{ cfg.ruleKind[props.row.rule_payunit] || "未知" }}
                                </el-form-item>
                                <!-- <el-form-item label="车位名称:"><span>{{ props.row.position }}</span></el-form-item>
                                <el-form-item label="车位数:"><span>{{ props.row.space }}</span></el-form-item> -->
                                <el-form-item label="添加时间:"
                                    ><span>{{ props.row.creationtime }}</span></el-form-item
                                >
                                <space-info :old_contract_id="props.row.id" :expanded="props.row.expanded"></space-info>

                                <template v-if="props.row.expanded && props.row.build_list.build_name">
                                    <el-form-item label="楼栋-单元:"
                                        ><span
                                            >{{ props.row.build_list.build_name }}<span> {{ props.row.build_name != "" && props.row.unitname != "" ? "-" : "" }} </span> {{ props.row.build_list.unitname }}</span
                                        ></el-form-item
                                    >
                                    <el-form-item label="楼层-房号:"
                                        ><span
                                            >{{ props.row.build_list.floor }}<span> {{ props.row.floor != "" && props.row.room_name != "" ? "-" : "" }} </span> {{ props.row.build_list.room_name }}</span
                                        ></el-form-item
                                    >
                                </template>
                                <el-form-item label="上次修改:"
                                    ><span>{{ props.row.modifiedtime }}</span></el-form-item
                                >
                            </el-form>
                            <div class="car-info-container">
                                <p>车辆：</p>
                                <div class="car_info">
                                    <div class="car_info_item">
                                        <span class="car_item_label">品牌:</span>
                                        <span class="car_item_text">{{ props.row.car_brand || "未知" }}</span>
                                    </div>
                                    <div class="car_info_item_type">
                                        <span class="car_item_label">类型:</span>
                                        <span class="car_item_text">{{ props.row.car_type || "未知" }}</span>
                                    </div>
                                    <div class="car_info_item_serial">
                                        <span class="car_item_label">型号:</span>
                                        <span class="car_item_text">{{ props.row.car_serial || "未知" }}</span>
                                    </div>
                                    <div class="car_info_item_color">
                                        <span class="car_item_label">颜色:</span>
                                        <span class="car_item_text">{{ props.row.car_color || "未知" }}</span>
                                    </div>
                                    <div class="car_info_item_img">
                                        <span class="car_item_label">图片:</span>
                                        <div class="car_refClickMask" v-if="props.row.car_hasimgs" @click="imgShow(props.row.id)"></div>
                                        <ul class="car_item_imgUl" :ref="'imgbox' + props.row.id">
                                            <!--  <template v-if='props.row.imgs.length>0'>
                                                <li v-for='(item,index) in props.row.imgs' :key='index' @click = 'imgShow(props.row)'>
                                                    <img :src="item.href" alt="">
                                                </li>
                                            </template>
                                            <template v-else>
                                                <span class="car_item_text">未查询到进出场图片</span>
                                            </template>  -->
                                        </ul>
                                    </div>
                                    <div>
                                        <el-button @click="editCarInfo(props.row)" icon="el-icon-edit-outline" plain size="mini">编辑车辆信息</el-button>
                                    </div>
                                </div>
                            </div>
                            <div class="box_btn">
                                <el-button v-if="authCheck('查看case日志')" @click="getHistory(props.row)" plain size="mini">CASE日志</el-button>
                                <template v-if="props.row.status !== 'canceled'">
                                    <!-- <el-button v-if="authCheck('查看车位信息')" @click="editCarPort(props.row)" plain size="mini">查看车位信息</el-button> -->
                                    <el-button v-if="authCheck('到期提醒')" @click="pushMsg(props.row)" plain size="mini">到期提醒</el-button>

                                    <el-button v-if="authCheck('换车牌日志列表查看')" @click="getPlateLog(props.row)" plain size="mini">换车牌日志</el-button>
                                    <el-button v-if="authCheck('锁车/解锁')" @click="setLock(props.row, 'unlock')" plain size="mini">解锁</el-button>
                                    <el-button v-if="authCheck('锁车/解锁')" @click="setLock(props.row, 'lock')" plain size="mini">锁车</el-button>
                                    <!-- 暂时 置灰 等待新接口 -->
                                    <el-button v-if="authCheck('跟随车场锁车/解锁')" @click="setLock4Station(props.row, 'lock')" plain size="mini" :disabled="true">跟随停车场锁车</el-button>
                                    <el-button v-if="authCheck('跟随车场锁车/解锁')" @click="setLock4Station(props.row, 'unlock')" plain size="mini" :disabled="true">不想被锁车</el-button>
                                    <el-button v-if="authCheck('车辆状态查看')" @click="getStatus(props.row)" plain size="mini" :disabled="true">读取状态</el-button>
                                    <el-button v-if="authCheck('月卡报停')" @click.once="setForbid(props.row)" plain size="mini" :disabled="props.row.plates.length > 1"><i class="fa fa-pencil-square-o"></i>月卡报停</el-button>
                                    <el-button v-if="authCheck('月卡换规则')" @click="setNewRule(props.row)" plain size="mini" :disabled="props.row.plates.length > 1"><i class="fa fa-pencil-square-o"></i>换规则</el-button>
                                    <el-button v-if="authCheck('申请换规则')" @click="addChangeRule(props.row)" plain size="mini" :disabled="props.row.plates.length > 1"><i class="fa fa-pencil-square-o"></i>申请换规则</el-button>
                                    <el-button v-if="authCheck('更换主车牌')" @click="changemasterhandler(props.row)" plain size="mini" :disabled="!(props.row.plates.length > 1)"><i class="fa fa-pencil-square-o"></i>更换主车牌</el-button>
                                    <el-button v-if="authCheck('收费房间')" @click="bindUnitHandler(props.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>收费房间</el-button>
                                </template>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="40"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="145"></el-table-column>
                    <el-table-column label="车牌" width="160">
                        <template slot-scope="props">
                            <div v-if="props.row.plates.length > 10">
                                <div>
                                    关联车牌过多，<el-button type="primary" size="mini" plain @click="showMorePlate(props.row)"><i class="fa fa-search"></i>查看详情</el-button>
                                </div>
                            </div>
                            <div v-else>{{ cutPlate(props.row.plates) }}</div>
                        </template>
                    </el-table-column>

                    <el-table-column label="状态" min-width="60">
                        <template slot-scope="scope">
                            <div v-html="statusFmt(scope.row.status, scope.row.time_end)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="time_begin" label="开始时间" width="130"></el-table-column>
                    <el-table-column prop="time_end" label="结束时间" width="130">
                        <template slot-scope="scope">
                            <div v-html="statusFmt_timeend(scope.row.time_end)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="460">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('月卡修改')" @click="updateClick(scope.$index, scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <template v-if="scope.row.status !== 'canceled'">
                                <el-button v-if="authCheck('月卡基本信息编辑') && scope.row.status !== 'canceled'" @click="updateClientClick(scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>基本信息</el-button>
                                <el-button v-if="authCheck('月卡重发') && scope.row.status !== 'canceled'" @click="sendClick(scope.row)" :disabled="scope.row.status == 'locked'" plain size="mini"><i class="fa fa-paper-plane-o"></i>重发本地</el-button>
                                <el-button v-if="authCheck('月卡删除') && scope.row.status !== 'canceled'" @click="delClick(scope.row, true)" :disabled="scope.row.status == 'canceled'" plain type="danger" size="mini"><i class="fa fa-trash-o"></i>清空本地</el-button>
                                <el-button v-if="authCheck('查看本地月卡')" @click="remoteShow(scope.$index, scope.row)" plain type="warning" size="mini"><i class="fa fa-info-circle"></i>查看本地</el-button>
                                <el-button v-if="authCheck('换车牌') && scope.row.status !== 'canceled'" @click="changePlateShow(scope.$index, scope.row)" :disabled="scope.row.plates.length > 1" plain size="mini"><i class="fa fa-exchange"></i>换车牌</el-button>
                                <el-button v-if="authCheck('月卡禁用启用') && scope.row.status !== 'canceled' && scope.row.status != 'locked'" @click="lockClick(scope.row)" plain type="success" size="mini"><i class="fa fa-lock"></i>禁用</el-button>
                                <el-button v-if="authCheck('月卡禁用启用') && scope.row.status !== 'canceled' && scope.row.status == 'locked'" @click="unlockClick(scope.row)" plain type="success" size="mini"><i class="fa fa-unlock"></i>启用</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <el-dialog :title="remoteInfo.title" width="80%" :visible.sync="remoteInfo.show" @close="remoteClose">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        <span>{{ remoteInfo.info.result }}</span>
                    </el-form-item>
                </el-form>
                <div v-show="localData.show" style="height: 220px;overflow-y: auto;">
                    <h3>返回结果：</h3>
                    <el-table v-loading="localData.shade" element-loading-text="拼命加载中" :data="localData.data" border fit style="width:100%">
                        <el-table-column prop="plate" label="车牌" width="120"></el-table-column>
                        <el-table-column prop="begin" label="申请时间" min-width="120"></el-table-column>
                        <el-table-column prop="end" label="到期时间" min-width="120"></el-table-column>
                        <el-table-column prop="new_money" label="月卡价格" min-width="80"></el-table-column>
                        <el-table-column prop="rule" label="月卡规则" min-width="120"></el-table-column>
                    </el-table>
                </div>
            </el-dialog>
            <!-- 换车牌  月卡报停 取消报停 后下发 S -->
            <el-dialog :title="plateInfo.title" width="80%" :visible.sync="plateInfo.show">
                <el-form :model="plateInfo.add" v-if="!(plateInfo.add && plateInfo.add.length === 0)" label-width="100px">
                    <h3 class="mtb5">{{ plateInfo.add.title }}</h3>
                    <el-form-item label="请求结果:">
                        <span>{{ plateInfo.add.info.result || "" }}</span>
                    </el-form-item>
                </el-form>
                <div v-show="plateInfo.delShow">
                    <el-form :model="plateInfo.del" label-width="100px">
                        <h3 class="mtb5">{{ plateInfo.del.title }}</h3>
                        <el-form-item label="请求结果:">
                            <span>{{ plateInfo.del.info.result || "" }}</span>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-show="plateInfo.enableShow">
                    <el-form :model="plateInfo.enable" label-width="100px">
                        <h3 class="mtb5">{{ plateInfo.enable.title }}</h3>
                        <el-form-item label="请求结果:">
                            <span>{{ plateInfo.enable.info.result || "" }}</span>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-show="plateInfo.disableShow">
                    <el-form :model="plateInfo.disable" label-width="100px">
                        <h3 class="mtb5">{{ plateInfo.disable.title }}</h3>
                        <el-form-item label="请求结果:">
                            <span>{{ plateInfo.disable.info.result || "" }}</span>
                        </el-form-item>
                    </el-form>
                </div>
            </el-dialog>
            <!-- 换车牌  月卡报停 取消报停 后下发 基本信息编辑 E -->
            <el-dialog :title="clientInfo.title" width="40%" :visible.sync="clientInfo.show">
                <el-form :model="clientInfo.data" label-width="130px">
                    <el-form-item label="用户姓名:">
                        <el-input v-model="clientInfo.data.name" size="small" class="cell widthX200" placeholder="请输入用户姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="月卡手机号:">
                        <el-input v-model="clientInfo.data.mobile" size="small" class="cell widthX200" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="收费规则:">
                        <el-select v-model="clientInfo.data.rule_id" size="small" class="cell widthX200" placeholder="规则" v-loading="getRulesLoading">
                            <el-option v-for="item in filterRulesInStation" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{ item.name }}</span>
                                <span class="ruleN1">¥:{{ item.N1 }}</span>
                            </el-option>
                        </el-select>
                        <div class="ruletip">规则只能低价改高价，有效期随之改变</div>
                    </el-form-item>

                    <truck-space v-if="clientInfo.show" ref="truckSpaceBaseInfo" :station_type="clientInfo.data.station_type" :station_id="clientInfo.data.station_id" :old_contract_id="clientInfo.data.id" :type="space.type" :rule_id="clientInfo.data.rule_id" :isSubmit="space.isSubmit" @submitOver="handleSubmitOver"></truck-space>

                    <el-form-item label="开始时间:">
                        <el-date-picker v-model="clientInfo.data.time_begin" value-format="yyyy-MM-dd" size="small" type="date" class="cell widthX200" :disabled="true" placeholder="选择开始时间"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="结束时间:">
                        <el-date-picker v-model="clientInfo.data.time_end" value-format="yyyy-MM-dd" size="small" type="date" class="cell widthX200" :picker-options="endDatePicker" placeholder="选择结束时间"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="状态:">
                        <el-select v-model="clientInfo.data.status" clearable size="small" class="cell widthX200" placeholder="状态">
                            <el-option label="已取消" value="canceled"></el-option>
                        </el-select>
                        <div class="ruletip">谨慎操作'已取消'状态，操作后不可恢复</div>
                    </el-form-item>
                    <el-form-item label="是否允许线上缴费:">
                        <el-radio v-model="clientInfo.data.visiable" label="Y">是</el-radio>
                        <el-radio v-model="clientInfo.data.visiable" label="N">否</el-radio>
                    </el-form-item>
                    <el-form-item>
                        <!-- <el-button @click="submitClientInfo(0)" type="primary" size="small">提交</el-button> -->
                        <el-button @click="submitClientInfo(1)" type="primary" size="small">提交后发送厂家</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="edit.title" width="600px" :visible.sync="edit.show">
                <el-form :model="edit.data" label-width="130px">
                    <el-form-item label="停车场:">
                        <my-select-station size="small" v-model="edit.data.station_id" :disabled="edit.data.id != 0" width="220px" placeholder="请输入停车场" @select="SelectUpdateStation"></my-select-station>
                    </el-form-item>
                    <el-form-item label="主卡车牌:">
                        <my-select-plate v-model="edit.data.car_id" :disabled="edit.data.id != 0" size="small" width="220px" placeholder="请输入车牌" :addnewplate="true" @addOne="addOnePlate"></my-select-plate>
                    </el-form-item>
                    <el-form-item label="类型:">
                        <el-select v-model="edit.data.type" size="small" class="cell widthX200" placeholder="类型">
                            <el-option :value="0" label="一卡多车"></el-option>
                            <el-option :value="1" label="子母车"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-for="(item, index) in edit.data.plates" :key="index" :label="'副卡车牌' + index + ':'">
                        <my-select-plate v-model="item.car_id" size="small" class="widthX120 mr10 inline-block vmiddle"></my-select-plate>
                        <el-button v-if="index > 0" size="mini" @click.prevent="removeSubPlate(index)" type="danger" class="inline-block vmiddle">删除副卡</el-button>
                        <el-button v-if="index == 0" @click="addSubPlate" size="mini" type="success" class="inline-block"><i class="el-icon-circle-plus"></i>新增副卡</el-button>
                    </el-form-item>
                    <el-form-item label="收费规则:">
                        <el-select v-model="edit.data.rule_id" size="small" class="cell widthX200" placeholder="规则" v-loading="getRulesLoading" filterable>
                            <el-option v-for="item in rulesInStation" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{ item.name }}</span>
                                <span class="ruleN1">¥:{{ item.N1 }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="用户姓名:">
                        <el-input v-model="edit.data.name" size="small" class="cell widthX200" placeholder="请输入用户姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="月卡手机号:">
                        <el-input v-model="edit.data.mobile" size="small" class="cell widthX200" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="开始时间:">
                        <el-date-picker v-model="edit.data.time_begin" value-format="yyyy-MM-dd" size="small" type="date" class="cell widthX200" placeholder="选择开始时间"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="结束时间:">
                        <el-date-picker v-model="edit.data.time_end" value-format="yyyy-MM-dd" size="small" type="date" class="cell widthX200" placeholder="选择结束时间"></el-date-picker>
                    </el-form-item>
                    <truck-space v-if="edit.show" ref="truckspace" :station_type="edit.data.station_type" :station_id="edit.data.station_id" :old_contract_id="edit.data.id" :type="space.type" :rule_id="edit.data.rule_id"></truck-space>
                    <el-form-item label="状态:">
                        <el-select v-model="edit.data.status" clearable size="small" class="cell widthX200" placeholder="状态">
                            <el-option label="已取消" value="canceled"></el-option>
                            <el-option label="使用中" value="working"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否允许线上缴费:">
                        <el-radio v-model="edit.data.visiable" label="Y">是</el-radio>
                        <el-radio v-model="edit.data.visiable" label="N">否</el-radio>
                    </el-form-item>
                    <el-form-item label="是否紧急开闸:" v-if="edit.data.id">
                        <el-radio v-model="edit.data.eopen" label="Y">是</el-radio>
                        <el-radio v-model="edit.data.eopen" label="N">否</el-radio>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitOk(0)" type="primary" size="small">提交</el-button>
                        <el-button @click="submitOk(1)" type="primary" size="small">提交后发送厂家</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 提交弹窗 -->
            <el-dialog title="提交时间线" width="40%" :visible.sync="edit.submitLoading"> </el-dialog>

            <el-dialog :title="changePlate.title" width="40%" :visible.sync="changePlate.show">
                <el-form :model="changePlate.info" label-width="120px">
                    <el-form-item label="旧车牌:">
                        <my-select-plate v-model="changePlate.info.oldPlate" :disabled="true" size="small" width="220px" placeholder="请输入新车牌号" style="top:0"></my-select-plate>
                    </el-form-item>
                    <el-form-item label="新车牌:">
                        <my-select-plate v-model="changePlate.info.newPlate" size="small" width="220px" placeholder="请输入新车牌号" style="top:0"></my-select-plate>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="changePlateSubmit" type="primary" size="small" :disabled="changePlate.submitBtn">确认更换车牌</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="changePlateLog.title" :visible.sync="changePlateLog.show">
                <div class="table">
                    <el-table v-loading="changePlateLog.loading" element-loading-text="拼命加载中" :data="changePlateLog.data" border fit style="width:100%">
                        <el-table-column prop="date" label="日期" width="150"></el-table-column>
                        <el-table-column prop="oldPlate" label="旧车牌" min-width="90"></el-table-column>
                        <el-table-column prop="newPlate" label="新车牌" min-width="90"></el-table-column>
                        <el-table-column prop="username" label="操作员" width="120"> </el-table-column>
                    </el-table>
                </div>
            </el-dialog>
            <!--  更换主卡 -->
            <el-dialog :title="changemaster.title" :visible.sync="changemaster.show">
                <el-form :model="changemaster.info" label-width="120px">
                    <el-form-item label="当前主车牌:">
                        <el-input v-model="changemaster.info.old_master" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="新主车牌:">
                        <el-select v-model="changemaster.info.new_master" size="small" class="cell widthX200" placeholder="选择新主车牌">
                            <el-option v-for="item in plateInRow.notmaster" :key="item.car_id" :value="item.car_id" :label="item.plate"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="changemasterSubmit" type="primary" size="small" :disabled="changemaster.submitBtn">确认更换主车牌</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 读取状态 S -->
            <el-dialog :title="readStatus.title" :visible.sync="readStatus.show">
                <div class="table">
                    <!-- <p>当前状态:{{readStatus.content.nolock}}</p> -->
                    <p>{{ setStatusCurrent(readStatus.content) }}</p>
                    <p>{{ setStatusDes(readStatus.content) }}</p>
                    <p>历史轨迹:</p>
                    <el-table v-loading="readStatus.loading" element-loading-text="拼命加载中" :data="readStatus.data" border fit style="width:100%" class="haha">
                        <el-table-column prop="date" label="日期" width="150"></el-table-column>
                        <el-table-column prop="derection" label="进场/出场" min-width="90"></el-table-column>
                        <el-table-column prop="station_name" label="停车场" min-width="90"></el-table-column>
                    </el-table>
                </div>
            </el-dialog>
            <!-- 读取状态 E -->
            <!-- 月卡报停 S -->
            <el-dialog :title="forbidBox.title" width="40%" :visible.sync="forbidBox.show">
                <div v-if="forbidBox.contractStopStatus">
                    <div>
                        <span class="timeZone"
                            >月卡报停时间范围是:<span>{{ forbidBox.startTime }}</span> 到 <span>{{ forbidBox.endTime }}</span></span
                        >
                    </div>
                    <div class="stopBtn">
                        <el-button @click.once="cancelForbid" type="primary" size="small">取消报停</el-button>
                    </div>
                </div>
                <el-form :model="forbidBox.info" v-else>
                    <el-form-item label="起止时间:" label-width="100px">
                        <el-date-picker :disabled-date="disabledDate" v-model="forbidBox.info.time" size="small" type="daterange" class="cell widthX200" placeholder="选择时间范围" value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label-width="120px">
                        <el-button @click="submitNewTime" type="primary" size="small">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 月卡报停 E -->
            <!-- 换规则 S -->
            <el-dialog :title="changeRule.title" width="40%" :visible.sync="changeRule.show">
                <el-form>
                    <el-form-item label="当前规则:" label-width="100px">
                        <el-input v-model="changeRule.info.oldRule" placeholder="当前无规则" :disabled="true">
                            <template slot="append">¥:{{ changeRule.rule_N1 }}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="新规则:" label-width="100px">
                        <el-select v-model="changeRule.info.newRule" class="widthP100" placeholder="选择新规则" v-loading="getRulesLoading">
                            <el-option v-for="item in rulesInStation" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{ item.name }}</span>
                                <span class="ruleN1">¥:{{ item.N1 }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="更改有效期:" label-width="100px">
                        <el-radio v-model="changeRule.info.status" label="change">是</el-radio>
                        <el-radio v-model="changeRule.info.status" label="no_change">否</el-radio>
                    </el-form-item>
                    <el-form-item label-width="120px">
                        <el-button @click="submitNewRule" type="primary" size="small">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 换规则 E -->
            <!-- 申请换规则 S -->
            <el-dialog :title="newRule.title" width="60%" :visible.sync="newRule.show">
                <el-form label-width="120px">
                    <el-form-item label="车牌号:">
                        <my-select-plate v-model="newRule.info.car_id" :disabled="true"></my-select-plate>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <my-select-station v-model="newRule.info.station_id" :disabled="true"></my-select-station>
                    </el-form-item>
                    <el-form-item label="当前规则:">
                        <el-input v-model="newRule.info.old_rulename" placeholder="当前无规则" :disabled="true">
                            <template slot="append">¥:{{ newRule.rule_N1 }}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="新规则:">
                        <el-select v-model="newRule.info.new_rule" class="widthP100" placeholder="选择新规则" v-loading="getRulesLoading">
                            <el-option v-for="item in rulesInStation" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{ item.name }}</span>
                                <span class="ruleN1">¥:{{ item.N1 }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="上传凭证:">
                        <div class="certloader" v-if="filesList.length < cfg.uploadLimit">
                            <input type="file" ref="img" multiple="multiple" @change="fileload" />
                            <i class="el-icon-plus avatar-uploader-icon"></i>
                        </div>
                        <p class="img_tip">图片不能大于500K,图片格式为:jpg,png,gif,最多只能上传{{ cfg.uploadLimit }}张图片</p>
                        <div class="imgPrew">
                            <ul v-if="filesList.length > 0">
                                <li v-for="(item, index) in filesList" :key="index">
                                    <span><i class="fa fa-close" @click="delImg(index)"></i></span>
                                    <img :src="item" class="avatar" />
                                </li>
                            </ul>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button @click="saveNewRule" type="primary" size="small" :loading="saveloading">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 申请换规则 E -->
            <!-- CASE日志 S -->
            <el-dialog :title="opHistory.title" :visible.sync="opHistory.show" width="80%">
                <div class="tip" v-show="hasCase"><i class="fa fa-frown-o"></i>当前case记录为空</div>
                <div class="vertical-container light-timeline" v-loading="opHistory.loading">
                    <template v-for="(item, index) in opHistory.data">
                        <div class="vertical-timeline-block" :key="index">
                            <div :class="['vertical-timeline-icon', bgStyle[index % bgStyle.length] + '-bg']">
                                <div :class="['timeline-calendar', bgStyle[index % bgStyle.length] + '-bg']"><i class="fa fa-calendar"></i></div>
                                <div class="time-text">{{ item.createTime }}</div>
                            </div>
                            <div class="vertical-timeline-content">
                                <div class="timeline-head">
                                    <div class="head-wrap">
                                        <ul class="head-info" v-html="headInfo(item.lists, index)"></ul>
                                        <el-button plain size="mini" @click="showContent(item)"> 查看详情</el-button>
                                    </div>
                                    <div class="timeline-contrast" v-html="changeContent(item.lists)"></div>
                                </div>
                                <div class="timeline-table-wrap" v-html="opDetail(item.lists)" v-show="item.show"></div>
                            </div>
                        </div>
                    </template>
                </div>
                <my-paginator @change="setDialogPageData($event)" :pagination="dialogPagination"></my-paginator>
            </el-dialog>
            <!-- CASE日志 E -->
            <!-- 车位管理 S -->
            <el-dialog :title="record.title" :visible.sync="record.show">
                <el-form :model="record.info" v-loading="record.formloading" label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="record.info.station" size="small" class="cell" width="100%" placeholder="停车场" style="top:0"></my-select-station>
                    </el-form-item>
                    <el-form-item label="手机号:">
                        <el-input v-model="record.info.mobile" size="small" placeholder="手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="楼栋:">
                        <el-input v-model="record.info.building" size="small" placeholder="楼栋"></el-input>
                    </el-form-item>
                    <el-form-item label="单元:">
                        <el-input v-model="record.info.unit" size="small" placeholder="单元"></el-input>
                    </el-form-item>
                    <el-form-item label="楼层:">
                        <el-input v-model="record.info.floor" size="small" placeholder="楼层(只能是数字)" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="面积:">
                        <el-input v-model="record.info.area" size="small" placeholder="面积"></el-input>
                    </el-form-item>
                    <el-form-item label="集团内部编码:">
                        <el-input v-model="record.info.qrcode" size="small" placeholder="集团内部编码"></el-input>
                    </el-form-item>
                    <el-form-item label="车位编码:">
                        <el-input v-model="record.info.visible" size="small" placeholder="车位编码"></el-input>
                    </el-form-item>

                    <el-form-item v-if="authCheck('编辑车位信息')">
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 车位管理 E -->
            <!-- 添加新车牌 E -->
            <my-add-plate :showpop="addnewplateDialog" @addCb="platecallback" />
            <!-- 物业费绑定 S -->
            <el-dialog :title="unitinfo.title" :visible.sync="unitinfo.show">
                <el-form :model="unitinfo.info" label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="unitinfo.info.station_id" size="small" class="cell" width="100%" placeholder="停车场" style="top:0" @select="selectStationId"></my-select-station>
                    </el-form-item>
                    <el-form-item label="楼栋:">
                        <el-select v-model="unitinfo.info.building_id" class="widthP100" placeholder="楼栋" v-loading="unitinfo.getbuildsLoading" @change="changeBuildId" filterable>
                            <el-option v-for="item in unitinfo.builds" :key="item.id" :value="item.id" :label="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="房间:">
                        <el-select v-model="unitinfo.info.unitid" class="widthP100" placeholder="房间" v-loading="unitinfo.getunitsLoading" filterable>
                            <el-option v-for="item in unitinfo.units" :key="item.id" :value="item.id" :label="item.id">
                                <span>{{ item.id }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="绑定:">
                        <el-checkbox-group v-model="unitinfo.info.unit_channel">
                            <el-checkbox v-for="(key, val) in cfg.feetype" :label="val" :key="key">{{ key }}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="bindunitSubmit" :loading="unitinfo.submitloading" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="unitinfo.title_user" :visible.sync="unitinfo.show_user">
                <el-form :model="unitinfo.user" label-width="120px" v-loading="unitinfo.loading_user">
                    <el-form-item label="用户名:">
                        <el-input v-model="unitinfo.user.tenement" size="small" placeholder="用户名" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="手机:">
                        <el-input v-model="unitinfo.user.mobilephone" size="small" placeholder="手机" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="楼栋:">
                        <el-input v-model="unitinfo.user.unitname" size="small" placeholder="楼栋" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="房间:">
                        <el-input v-model="unitinfo.user.room_no" size="small" placeholder="房间" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="楼层:">
                        <el-input v-model="unitinfo.user.floor" size="small" placeholder="楼层" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="绑定:">
                        <el-checkbox-group v-model="unitinfo.user.unit_channel" disabled>
                            <el-checkbox v-for="(key, val) in cfg.feetype" :label="val" :key="key">{{ key }}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="redoBind" :loading="unitinfo.submitloading" type="primary" size="small">重新编辑</el-button>
                        <el-button @click="unbindSubmit" :loading="unitinfo.submitloading" type="primary" plain size="small">解绑</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 物业费绑定 E -->
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <el-dialog title="关联车牌信息" :visible.sync="isMorePlate">
                <div class="contract-plate-search">
                    <el-input placeholder="请输入车牌" v-model="morePlateSearch" clearable>
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </div>
                <div class="contract-plate-content">
                    <div class="contract-plate-item" v-for="item in calMorePlateData" :key="item.car_id">
                        <div>车牌：{{ item.plate }}</div>
                        <div>车型：{{ item.model }}</div>
                        <div>颜色：{{ item.color }}</div>
                        <div>
                            类型：<el-tag size="mini" :type="item.is_master === 1 ? 'danger' : ''">{{ item.is_master === 1 ? "主" : "副" }}</el-tag>
                        </div>
                        <div class="contract-plate-item-btn" @click="delPlate(item.plate, allPlateData)"><i class="fa fa-close"></i></div>
                    </div>
                </div>
            </el-dialog>
            <el-dialog title="编辑车辆信息" :visible.sync="isShowEditCarInfo" width="450px">
                <div class="car-info-wrapper">
                    <div class="car-info">
                        &nbsp;&nbsp;&nbsp;&nbsp;车牌号：<span>{{ curCarInfo.car_plate }}</span>
                    </div>
                    <div class="car-info">
                        车辆品牌：
                        <el-select
                            v-model="curCarInfo.car_brand"
                            filterable
                            remote
                            placeholder="请输入车辆品牌"
                            :remote-method="
                                query => {
                                    getCarInfo(query, 'brand');
                                }
                            "
                            :loading="curCarInfoLoading"
                            @focus="
                                query => {
                                    getCarInfo((query = ''), 'brand');
                                }
                            "
                        >
                            <el-option v-for="(item, idx) in carBrandList" :key="`1-${idx}`" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </div>
                    <div class="car-info">
                        车辆类型：
                        <el-select
                            v-model="curCarInfo.car_type"
                            filterable
                            remote
                            placeholder="请输入车辆类型"
                            :remote-method="
                                query => {
                                    getCarInfo(query, 'type');
                                }
                            "
                            :loading="curCarInfoLoading"
                            @focus="
                                query => {
                                    getCarInfo((query = ''), 'type');
                                }
                            "
                        >
                            <el-option v-for="(item, idx) in carTypeList" :key="`2-${idx}`" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </div>
                    <div class="car-info">
                        车辆型号：
                        <el-select
                            v-model="curCarInfo.car_serial"
                            filterable
                            remote
                            placeholder="请输入车辆型号"
                            :remote-method="
                                query => {
                                    getCarInfo(query, 'serial');
                                }
                            "
                            :loading="curCarInfoLoading"
                            @focus="
                                query => {
                                    getCarInfo((query = ''), 'serial');
                                }
                            "
                            :disabled="!(curCarInfo.car_brand && curCarInfo.car_type)"
                        >
                            <el-option v-for="(item, idx) in carSerialList" :key="`3-${idx}`" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </div>
                    <div class="car-info">
                        车辆颜色：
                        <el-select
                            v-model="curCarInfo.car_color"
                            filterable
                            remote
                            placeholder="请输入车辆颜色"
                            :remote-method="
                                query => {
                                    getCarInfo(query, 'color');
                                }
                            "
                            :loading="curCarInfoLoading"
                            @focus="
                                query => {
                                    getCarInfo((query = ''), 'color');
                                }
                            "
                        >
                            <el-option v-for="(item, idx) in carColorList" :key="`4-${idx}`" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </div>
                    <div class="btn-save">
                        <el-button @click="saveCarInfo" type="primary" size="small" :loading="saveCarInfoLoading">保存</el-button>
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
import selectProperty from "../../../utils/select-property.vue";
import previewImg from "../../component/previewImg/index.vue";
import TruckSpace from "../../component/contract/truck_space.vue";
import SpaceInfo from "../../component/contract/space_info.vue";
import BuildSearch from "../../component/contract/build_search.vue";
export default {
    data: function() {
        var config = {
            uploadLimit: 3,
            status: { apply: "apply", created: "已创建", working: "使用中", locked: "已禁用", delayed: "delayed", canceled: "已取消", deleted: "已删除" },
            ruleKind: { Y: "年卡", M: "月卡", D: "日卡", S: "季卡", T: "次卡" },
            feetype: { property: "物业费", bankdeduct: "银行代扣" },
            url: {
                bindUnit: {
                    //绑定楼栋信息 API
                    add: "/arrears/add",
                    getbuild: "/arrears/building",
                    getunit: "/arrears/units",
                    getownerinfo: "/arrears/ownerinfo"
                }
            },
            linkPlate: ""
        };
        return {
            saveCarInfoLoading: false,
            timer: null,
            carBrandList: [],
            carTypeList: [],
            carSerialList: [],
            carColorList: [],
            curCarInfoLoading: false,
            curCarInfo: { car_plate: "", car_brand: "", car_type: "", car_serial: "", car_color: "" },
            // cacheCarInfo: { car_brand: '', car_type: '', car_serial: '', car_color: '' },
            isShowEditCarInfo: false,
            cfg: config,
            shade: false,
            search_more: false,
            addnewplateDialog: false,
            changePlateLogshade: false,
            search: { dept: "dept", domain_id: "", station_id: "", car_id: "", username: "", phone: "", status: "", position: "", type: "", rule_id: "", is_expired: "", property_id: "", unit_name: "", room_name: "" },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            dialogPagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            rulesInStation: [],
            ruleSearch: { show: false, loading: false },
            remoteInfo: { title: "", cmd: "", show: false, info: {} },
            edit: { title: "", show: false, data: { id: 0, type: "0", station_type: "0", station_id: 0, car_id: 0, mobile: "", plates: [{ car_id: "" }], time_begin: "", time_end: "", room: "", unit: "", rule_id: "", position: "", inside: 0, space: 1, visiable: "Y", status: "", name: "" } },
            clientInfo: { title: "", show: false, submitBtn: false, data: { id: 0, station_id: 0, name: "", mobile: "", room: "", unit: "", position: "", inside: 0, space: 1, time_begin: "", time_end: "", visiable: "Y", rule_N1: "", status: "" } },
            changePlateLogData: [],
            plateInfo: { title: "", show: false, add: { title: "", info: { url: "", params: "", result: "" } }, del: { title: "", info: { url: "", params: "", result: "" } }, enable: { title: "", info: { url: "", params: "", result: "" } }, disable: { title: "", info: { url: "", params: "", result: "" } }, delShow: false, enableShow: false, disableShow: false },
            changePlateLog: { title: "", show: false, loading: false, data: [] },
            opHistory: { title: "", show: false, loading: false, data: [] },
            readStatus: { title: "", show: false, loading: false, data: [], content: "" },
            changePlate: { title: "", show: false, submitBtn: false, info: { oldPlate: "", newPlate: "", station: "", contract_id: "" } },
            changemaster: { title: "", show: false, submitBtn: false, row: {}, info: { old_master: "", new_master: "" } },
            changeRule: { title: "", show: false, contract_id: "", info: { oldRule: "", newRule: "", status: "change" }, rule_N1: "" },
            newRule: { title: "", show: false, info: { car_id: "", img: "", image: "", new_rule: "", old_rule: "", station_id: "" }, rule_N1: "" },
            forbidBox: { title: "", show: false, contractStopStatus: false, startTime: "", endTime: "", id: "", contract_id: "", info: { time: [] } },
            activeId: "",
            disabledDate: "",
            endDatePicker: this.processDate(),
            hasCase: false,
            bgStyle: ["blue", "lazur", "navy", "yellow"],
            localData: { show: false, shade: false, data: [] },
            record: { formloading: false, show: false, title: "", isadd: "", contract_id: "", position: "", info: { station: "", mobile: "", building: "", unit: "", floor: "", area: "", qrcode: "", visible: "" } },
            saveloading: false,
            filesList: [],
            postImg: [],
            getRulesLoading: false,
            plateInRow: {},
            unitinfo: { show: false, title: "", builds: [], getbuildsLoading: false, getunitsLoading: false, units: [], submitloading: false, info: { car_id: "", rule_id: "", station_id: "", building_id: "", unitid: "", unit_channel: [] }, loading_user: false, show_user: false, title_user: "", user: { tenement: "", mobilephone: "", unitname: "", room_no: "", floor: "", unit_channel: [] } },
            currentRow: "",
            images: { show: false, lists: [] },
            imgsIndex: 0,
            imagesStore: {},
            isMorePlate: false,
            allPlateData: "",
            morePlateData: [],
            morePlateSearch: "",
            space: {
                type: "add",
                isSubmit: false
            }
        };
    },
    components: {
        "select-property": selectProperty,
        "preview-img": previewImg,
        TruckSpace,
        SpaceInfo,
        BuildSearch
    },
    computed: {
        calMorePlateData() {
            if (this.morePlateData.length > 0) {
                let tempData = this.morePlateData.filter(item => {
                    return item.plate.toLowerCase().indexOf(this.morePlateSearch.toLowerCase()) != -1;
                });
                return tempData;
            } else {
                return [];
            }
        },
        filterRulesInStation() {
            let tempArr = [];
            tempArr = this.rulesInStation.filter(item => {
                if (item.N1 >= this.clientInfo.data.rule_N1) {
                    return item;
                }
            });
            return tempArr;
        }
    },
    methods: {
        rowClick(row) {
            let vm = this;
            vm.imgsIndex = vm.tableData.findIndex(item => {
                return item.id === row.id;
            });
            console.log(vm.imgsIndex);
            if (!row.expanded) {
                //图片有时效性，暂不缓存
                let a_id = row.latest_arrival; //进场
                let d_id = row.latest_departure; //出场
                let p1 = vm.imgLoad(a_id, "in", row);
                let p2 = vm.imgLoad(d_id, "out", row);
                Promise.all([p1, p2])
                    .then(res => {
                        let arr = [...res[0], ...res[1]];
                        vm.images.lists = arr;
                        if (arr.length > 0) {
                            vm.imagesStore["idx" + vm.imgsIndex] = arr;
                            console.log(vm.imagesStore);
                        }
                        vm.setRefContent(arr, row);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            if (!row.expanded) {
                this.getSpaceLists(row);
            }
        },
        getSpaceLists(row) {
            utils
                .fetchNew("et_admin.contract.spaceshow", {
                    old_contract_id: row.id
                })
                .then(res => {
                    if (res && res.code === 0 && res.content) {
                        row.build_list = res.content.build_list || {};
                    } else {
                        row.build_list = {};
                    }
                    row.expanded = !row.expanded;
                });
        },
        imgLoad: function(id, type, row) {
            var vm = this;
            let url = `/inout/images?type=${type}&station_id=${row.station}&id=${id}`;
            return utils.fetch(url).then(function(json) {
                if (typeof json != "undefined" && json.code == 0 && json.content.length > 0) {
                    let imagesArr = json.content.slice(0, 2);
                    return imagesArr;
                } else {
                    return false;
                }
            });
        },
        setRefContent(arr, row) {
            let ref_name = "imgbox" + row.id;
            if (arr.length === 0) {
                row.car_hasimgs = false;
                this.$refs[ref_name].innerHTML = `<span class="car_item_text">未查询到进出场图片</span>`;
                return;
            }
            row.car_hasimgs = true;
            let imgsStr = "";
            arr.forEach(item => {
                imgsStr += `<li><img src="${item.href}" alt=""></li>`;
            });
            this.$refs[ref_name].innerHTML = imgsStr;
        },
        imgClose() {
            this.images.show = false;
        },
        imgShow(id) {
            let index = this.tableData.findIndex(item => item.id === id);
            this.images.show = true;
            this.images.lists = this.imagesStore["idx" + index];
        },
        bindUnitHandler(row) {
            let vm = this;
            vm.currentRow = Object.assign({}, row);
            if (row.unitid) {
                let url = vm.cfg.url.bindUnit.getownerinfo + "?unitid=" + row.unitid + "&contract_id=" + row.id;
                vm.unitinfo.loading_user = true;
                vm.unitinfo.info.car_id = row.car;
                vm.unitinfo.info.station_id = row.station;
                vm.unitinfo.info.rule_id = row.rule;
                utils.fetch(url).then(function(res) {
                    if (res && res.code === 0) {
                        vm.unitinfo.user = res.content.lists;
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                        vm.unitinfo.user = { tenement: "", mobilephone: "", unitname: "", room_no: "", floor: "", unit_channel: [] };
                    }
                    vm.unitinfo.loading_user = false;
                });
                vm.unitinfo.show_user = true;
                vm.unitinfo.title_user = "信息显示";
            } else {
                vm.unitinfo = { show: true, title: "收费房间", builds: [], getbuildsLoading: false, getunitsLoading: false, units: [], submitloading: false, info: { car_id: row.car, rule_id: row.rule, station_id: row.station, building_id: "", unitid: "", unit_channel: row.unit_channel || [] }, loading_user: false, show_user: false, title_user: "", user: { tenement: "", mobilephone: "", unitname: "", room_no: "", floor: "", unit_channel: [] } };
                vm.getBuilds(row.station);
            }
        },
        redoBind() {
            let vm = this;
            vm.currentRow.unitid = "";
            vm.bindUnitHandler(vm.currentRow);
        },
        bindunitSubmit() {
            let vm = this;
            let url = vm.cfg.url.bindUnit.add;
            let unitInfo = vm.unitinfo.info;
            if (unitInfo.station_id === "") {
                vm.$message({ showClose: true, message: "停车场不能为空", type: "error" });
                return;
            }
            if (unitInfo.building_id === "" || unitInfo.unitid === "" || unitInfo.unit_channel.length === 0) {
                vm.$message({ showClose: true, message: "楼栋,房号,绑定渠道不能为空", type: "error" });
                return;
            }
            let data = Object.assign({}, unitInfo);
            data.unit_channel = data.unit_channel.join(",");
            vm.unitinfo.submitloading = true;
            utils.fetch(url, { method: "POST", body: data }).then(function(res) {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        vm.unitinfo.show = false;
                        vm.$message({ showClose: true, message: "物业费绑定成功", type: "success" });
                        vm.getData();
                    }
                    vm.unitinfo.submitloading = false;
                }
            });
        },
        unbindSubmit() {
            let vm = this;
            let unitInfo = vm.unitinfo.info;
            var submitdata = {
                car_id: unitInfo.car_id,
                station_id: unitInfo.station_id,
                rule_id: unitInfo.rule_id
            };
            utils.fetch("/arrears/untie", { method: "POST", body: submitdata }).then(function(res) {
                if (res && res.code === 0) {
                    vm.unitinfo.show_user = false;
                    vm.$message({ showClose: true, message: "已解绑", type: "success" });
                    vm.getData();
                }
            });
        },
        changeBuildId(val) {
            this.unitinfo.info.unitid = "";
            this.unitinfo.units = [];
            this.getUnits(val);
        },
        selectStationId(obj) {
            this.unitinfo.info.building_id = "";
            this.unitinfo.builds = [];
            this.getBuilds(obj.id);
        },
        getBuilds(id) {
            let vm = this;
            let url = vm.cfg.url.bindUnit.getbuild + "?station_id=" + id;
            vm.unitinfo.getbuildsLoading = true;
            utils.fetch(url).then(function(res) {
                vm.unitinfo.builds = res && res.code === 0 ? res.content.lists : [];
                vm.unitinfo.getbuildsLoading = false;
            });
        },
        getUnits(id) {
            let vm = this;
            let url = vm.cfg.url.bindUnit.getunit + "?building_id=" + id;
            vm.unitinfo.getunitsLoading = true;
            utils.fetch(url).then(function(res) {
                vm.unitinfo.units = res && res.code === 0 ? res.content.lists : [];
                vm.unitinfo.getunitsLoading = false;
            });
        },
        ismasterOrNot(row) {
            let ismaster = row.plates.find(item => item.is_master === 1);
            let notmaster = row.plates.filter(item => item.is_master === 0);
            this.plateInRow = { ismaster, notmaster };
            console.log(this.plateInRow);
        },
        changemasterhandler(row) {
            let vm = this;
            vm.changemaster.title = "更换主车牌";
            vm.changemaster.show = true;
            vm.changemaster.row = row;
            vm.ismasterOrNot(row);
            vm.changemaster.info.old_master = vm.plateInRow.ismaster.plate;
            vm.changemaster.info.new_master = "";
        },
        changemasterSubmit() {
            let vm = this,
                master = vm.changemaster;
            const url = "/contract/changeMaster";
            if (master.info.new_master === "") {
                vm.$message({ showClose: true, message: "请选择新的主卡", type: "error" });
                return;
            }
            let data = { id: master.row.id, car_id: master.info.new_master };
            let row = { station: master.row.station, car: master.info.new_master, rule: master.row.rule };
            vm.changemaster.submitBtn = true;
            utils.fetch(url, { method: "POST", body: data }).then(function(res) {
                if (typeof res != "undefined") {
                    vm.changemaster.submitBtn = false;
                    if (res.code == 0) {
                        master.show = false;
                        vm.$message({ showClose: true, message: "更换主车牌成功,等待下发", type: "success" });
                        vm.getData();
                        vm.localData.show = false;
                        vm.oneCommond(row, "add");
                    } else {
                        vm.changemaster.info.new_master = "";
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        addChangeRule: function(row) {
            var vm = this;
            vm.filesList = [];
            vm.postImg = [];
            vm.newRule = { title: "申请换规则", show: true, loading: true, rule_N1: row.rule_N1, info: { car_id: row.car, img: "", image: "", new_rule: "", old_rule: row.rule, old_rulename: row.rule_name, station_id: row.station } };
            vm.getRulesLoading = true;
            utils.getRulesByStationID(row.station).then(function(arr) {
                vm.getRulesLoading = false;
                arr = arr.filter(function(item) {
                    return item.name != row.rule_name;
                });
                //筛选出新规则要比旧规则价格低的新规则，过滤掉9.9以下的月卡规则价格
                vm.rulesInStation = arr.filter(function(item) {
                    return item.N1 < row.rule_N1 && item.N1 >= 9.9;
                });
            });
        },
        fileload: function() {
            var vm = this;
            var limit = vm.cfg.uploadLimit;
            var files = vm.$refs.img.files;
            var len = files.length > limit ? limit : files.length;
            for (var i = 0; i < len; i++) {
                var url = "";
                if (window.createObjectURL != undefined) {
                    url = window.createObjectURL(vm.$refs.img.files[i]);
                } else if (window.URL != undefined) {
                    // IE
                    url = window.URL.createObjectURL(vm.$refs.img.files[i]);
                } else if (window.webkitURL != undefined) {
                    url = window.webkitURL.createObjectURL(vm.$refs.img.files[i]);
                }
                vm.postImg.push(vm.$refs.img.files[i]);
                vm.filesList.push(url);
            }
            var fileslistLen = vm.filesList.length;
            if (fileslistLen > limit) {
                vm.filesList = vm.filesList.slice(fileslistLen - limit);
                vm.postImg = vm.postImg.slice(fileslistLen - limit);
            }
        },
        delImg: function(index) {
            this.filesList.splice(index, 1);
            this.postImg.splice(index, 1);
        },
        saveNewRule: function() {
            var vm = this;
            var url = "/changerule/add";
            if (!vm.newRule.info.new_rule) {
                vm.$message({ showClose: true, message: "新规则不能为空", type: "error" });
                return;
            }
            if (vm.postImg.length == 0 && vm.$refs.img.files.length == 0) {
                vm.$message({ showClose: true, message: "请上传凭证", type: "error" });
                return;
            }
            var postdata = vm.newRule.info;
            var formData = new FormData();
            var pi = vm.postImg,
                len = pi.length;
            for (var i in postdata) {
                if (i == "old_rulename") {
                    continue;
                }
                if (i == "img") {
                    for (var k = 0; k < len; k++) {
                        formData.append("img[]", pi[k]);
                    }
                } else {
                    formData.append(i, postdata[i]);
                }
            }
            vm.saveloading = true;
            utils.fetch(url, { method: "POST", body: formData, headers: {} }).then(function(res) {
                if (typeof res != "undefined") {
                    vm.saveloading = false;
                    if (res.code == 0) {
                        vm.newRule.show = false;
                        //vm.getData();
                        vm.$router.push({ path: "/contract/changerule" });
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        getCurrentStationRules: function(id) {
            var vm = this;
            if (!id) {
                vm.ruleSearch.show = false;
                vm.rulesInStation = [];
                return;
            }
            vm.ruleSearch.show = true;
            vm.getRulesLoading = true;
            utils.getRulesByStationID(id).then(function(arr) {
                vm.getRulesLoading = false;
                vm.rulesInStation = arr;
            });
        },
        processDate: function() {
            var vm = this;
            return {
                disabledDate: function(time) {
                    return time.getTime() > new Date(vm.clientInfo.data.time_end).getTime();
                }
            };
        },
        platecallback: function(val) {
            this.addnewplateDialog = val;
        },
        addOnePlate: function() {
            this.edit.show = false;
            this.addnewplateDialog = true;
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        editCarPort: function(row) {
            var vm = this;
            vm.record.show = true;
            vm.record.title = "添加车位信息";
            vm.record.position = row.position || "-1";
            vm.record.contract_id = row.id;
            vm.record.formloading = true;
            var url = "/carport/show?carport_id=" + vm.record.position;
            utils.fetch(url).then(function(res) {
                if (res === "") {
                    vm.record.isadd = true;
                    vm.record.info = { station: "", mobile: "", building: "", unit: "", floor: "", area: "", qrcode: "", visible: "" };
                } else {
                    vm.record.isadd = false;
                    vm.record.info = res.content;
                }
                vm.record.formloading = false;
            });
        },
        editSubmit: function() {
            var vm = this;
            var mustFillMap = { station_id: "停车场", mobile: "手机号", building: "楼栋", unit: "单元", floor: "楼层", area: "面积", qrcode: "集团内部编码", visible: "车位编码" };
            for (var i in mustFillMap) {
                if (vm.record[i] === "") {
                    vm.$message({ showClose: true, message: mustFillMap[i] + "不能为空", type: "error" });
                    return;
                }
            }
            var url = vm.record.isadd ? "/carport/add" : "/carport/update";
            let { station: station_id, ...others } = vm.record.info;
            let postData = { station_id, ...others };
            postData.carport_id = vm.record.position;
            postData.contract_id = vm.record.contract_id;
            utils.fetch(url, { method: "POST", body: postData }).then(function(res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.record.show = false;
                        vm.$message({ showClose: true, message: res.message, type: "success" });
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        pushMsg: function(row) {
            var vm = this;
            var url = "/contract/sendMessage";
            var data = {
                contract_id: row.id,
                plate: row.plates[0].plate, //主车牌默认是第一个
                mobile: row.phone,
                station_name: row.station_name
            };
            utils.fetch(url, { method: "post", body: data }).then(function(res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.$message({ showClose: true, message: res.message, type: "success" });
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        showContent: function(item) {
            item.show = !item.show;
        },
        delPlate: function(plate, row) {
            //车牌删除
            var vm = this;
            var tmp = row.plates;
            for (var item in tmp) {
                if (plate == tmp[item]["plate"]) {
                    var sub_cars = tmp[item]["car_id"];
                    var is_master = tmp[item]["is_master"];
                }
            }
            var url = "/contract/delcard?station_id=" + row.station + "&rule_id=" + row.rule + "&car_id=" + sub_cars;
            if (is_master == "0") {
                //副卡
                url += "&is_sub=" + "1";
            }
            this.$msgbox({
                title: "提示",
                message: "删除车牌",
                showCancelButton: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: function(action, instance, done) {
                    if (action === "confirm") {
                        utils.fetch(url).then(function(json) {
                            if (typeof json != "undefined") {
                                if (json.code == 0) {
                                    vm.getData();
                                    vm.$message({ showClose: true, message: "删除车牌成功", type: "success" });
                                    vm.isMorePlate = false;
                                    if (is_master == "0") {
                                        vm.sendClick({ car: row.car, rule: row.rule, station: row.station }); //下发到厂家
                                    }
                                } else {
                                    vm.$message({ showClose: true, message: json.message, type: "error" });
                                    done();
                                }
                            } else {
                                done();
                            }
                        });
                        done();
                    } else {
                        done();
                    }
                }
            });
        },
        _isEmptyArray: function(a) {
            return Array.isArray(a) && a.length == 0;
        },
        changeContent: function(obj) {
            var result = "",
                vm = this;
            if (!obj || !obj.change_data || vm._isEmptyArray(obj.change_data)) {
                return "";
            } else {
                var newData = obj.change_data.new_data;
                var oldData = obj.change_data.old_data;
                //新数据
                var newStr = vm.getConcatStr(newData);
                var oldStr = vm.getConcatStr(oldData);
                if (newStr != "") {
                    result += '<div><span class="c_green">新数据</span>:' + newStr + "</div>";
                }
                if (oldStr != "") {
                    result += '<div><span class="c_red">旧数据</span>:' + oldStr + "</div>";
                }
                return result;
            }
        },
        getConcatStr: function(obj) {
            var concatStr = "",
                vm = this;
            var keymap = { lockStatus: "锁车状态", nolock: "车辆当前状态", phone: "手机号", plates: "子车牌", position: "车位名称", room: "房号", rule_name: "月卡规则", status: "状态", time_begin: "开始时间", time_end: "结束时间", unit: "楼栋号(部门)", visiable: "是否允许线上缴费" };
            var map2 = { Y: "是", N: "否" };
            if (obj && !vm._isEmptyArray(obj)) {
                for (var i in obj) {
                    if ("status" == i) {
                        concatStr += keymap[i] + ":" + vm.cfg.status[obj[i]] + ";";
                    } else if ("visiable" == i) {
                        concatStr += keymap[i] + ":" + map2[obj[i]] + ";";
                    } else {
                        concatStr += keymap[i] + ":" + obj[i] + ";";
                    }
                }
                return concatStr;
            } else {
                return "";
            }
        },
        headInfo: function(r, index) {
            if (!r) return "";
            var vm = this;
            var cls = vm.bgStyle[index % vm.bgStyle.length];
            var name = (name = r.username === "yxkj" ? r.content.operator : r.username);
            return "<li><i class='fa fa-user-o " + cls + "'></i>操作人:" + name + "</li>" + "<li><i class='fa fa-wrench " + cls + "'></i>操作类型:" + r.type + "</li>" + "<li><i class='fa fa-spinner " + cls + "'></i>操作结果:" + r.result + "</li>";
        },
        opDetail: function(r) {
            var vm = this;
            if (r && r.content) {
                var app = r.content.visiable == "Y" ? "是" : "否";
                var tableObj = { 子车牌: r.content.plates, 月卡规则: r.content.rule_name, 手机号: r.content.phone, 开始时间: r.content.time_begin, 结束时间: r.content.time_end, 车位名称: r.content.position, 房号: r.content.room, "楼栋号(部门)": r.content.unit, 是否允许线上缴费: app, 状态: vm.cfg.status[r.content.status], 锁车状态: r.content.lockStatus, 车辆当前状态: r.content.nolock };
                var str = utils.tableTemplate(tableObj, 5);
                return str;
            } else {
                return "查询不到内容";
            }
        },
        _resetShow: function() {
            this.plateInfo.delShow = false;
            this.plateInfo.enableShow = false;
            this.plateInfo.disableShow = false;
        },
        setNewRule: function(row) {
            var vm = this;
            vm.changeRule.show = true;
            vm.getRulesLoading = true;
            utils.getRulesByStationID(row.station).then(function(arr) {
                vm.getRulesLoading = false;
                arr = arr.filter(function(item) {
                    return item.name != row.rule_name;
                });
                (vm.changeRule = { title: "规则修改", show: true, contract_id: row.id, rule_N1: row.rule_N1, info: { oldRule: row.rule_name, newRule: "", status: "change" } }), (vm.rulesInStation = arr);
            });
        },
        submitNewRule: function() {
            var vm = this,
                data = {};
            var url = "/contract/changeRule";
            data = { contract_id: vm.changeRule.contract_id, rule_id: vm.changeRule.info.newRule, status: vm.changeRule.info.status };
            utils.fetch(url, { method: "POST", body: data }).then(function(json) {
                //获取规则列表
                if (json && json.code == 0) {
                    vm.changeRule.show = false;
                    vm.remoteInfo = { show: true, title: json.content.title };
                    vm.remoteInfo.info = json.content.info == false || json.content.info == "" ? { url: "", params: "", result: "" } : json.content.info;
                    vm.getData();
                } else {
                    vm.$message({ showClose: true, message: json.message, type: "error" });
                }
            });
        },
        cancelForbid: function() {
            if (this.authCheck("取消月卡报停") == false) return;
            var vm = this;
            var url = "/contract/removeStopContract"; //取消月卡报停
            var data = { car_id: vm.currentRow.car, station_id: vm.currentRow.station, id: vm.forbidBox.id, contract_id: vm.forbidBox.contract_id };
            utils.fetch(url, { method: "POST", body: data }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm._resetShow();
                        vm.forbidBox.show = false;
                        vm.plateInfo.show = true;
                        vm.plateInfo.enableShow = true;
                        vm.plateInfo.title = "取消月卡报停";
                        vm.plateInfo.add = json.content.add;
                        vm.plateInfo.enable = json.content.enable;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                    vm.forbidBox.info.time = [];
                }
            });
        },
        submitNewTime: function() {
            var vm = this,
                postData = {};
            var url = "/contract/stopContract"; //月卡报停
            var timeArr = vm.forbidBox.info.time;
            if (0 === timeArr.length) {
                vm.$message({ showClose: true, message: "请选择时间", type: "error" });
                return;
            }
            postData = { car_id: vm.currentRow.car, station_id: vm.currentRow.station, contract_id: vm.currentRow.id, time_begin: timeArr[0], time_end: timeArr[1] };
            utils.fetch(url, { method: "POST", body: postData }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm._resetShow();
                        vm.forbidBox.show = false;
                        vm.plateInfo.show = true;
                        vm.plateInfo.title = "月卡报停信息";
                        vm.plateInfo.add = json.content.add;
                        if (json.content.disable != "") {
                            vm.plateInfo.disableShow = true;
                            vm.plateInfo.disable = json.content.disable;
                        }
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                    vm.forbidBox.info.time = [];
                }
            });
        },
        setForbid: function(row) {
            var vm = this;
            vm.currentRow = Object.assign({}, row);
            vm.forbidBox.show = true;
            vm.forbidBox.title = "月卡报停";
            var url = "/contract/stopContractShow";
            var data = { car_id: row.car, station_id: row.station, rule_id: row.rule };
            vm.forbidBox.contract_id = row.id;
            utils.fetch(url, { method: "POST", body: data }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        if (!json.content.data || 0 == json.content.data.length) {
                            //无值
                            vm.forbidBox.contractStopStatus = false;
                        } else {
                            //有值
                            vm.forbidBox.contractStopStatus = true;
                            vm.forbidBox.startTime = json.content.data.time_begin;
                            vm.forbidBox.endTime = json.content.data.time_end;
                            vm.forbidBox.id = json.content.data.id;
                        }
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        setDialogPageData: function(pageObj) {
            this.dialogPagination = pageObj;
            this.getDialogData();
        },
        setStatusCurrent: function(obj) {
            if (obj == "") return;
            if (parseInt(obj.nolock) === 0) {
                return "当前状态:跟着停车场锁车";
            } else if (parseInt(obj.nolock) === 1) {
                return "当前状态:不想被锁车";
            } else {
                return "当前状态:无状态(既不跟着停车场锁车也不想被锁车)";
            }
        },
        setStatusDes: function(obj) {
            if (obj == "") return;
            if (obj.lockDate == "") {
                return "当前锁车状态:" + obj.lockStatus;
            } else {
                return "当前锁车状态:" + obj.lockStatus + ";  停车场:" + obj.station + ";   " + obj.lockStatus + "时间:" + obj.lockDate;
            }
        },
        getStatus: function(row) {
            var vm = this;
            var postdata = { car_id: row.car, contract_id: row.id };
            vm.readStatus.show = true;
            vm.readStatus.title = "车辆状态信息";
            vm.readStatus.loading = true;
            utils.fetch("/car/getStatus", { method: "POST", body: postdata }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.readStatus.data = json.content.all;
                        vm.readStatus.content = json.content;
                        vm.readStatus.loading = false;
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        setLock4Station: function(row, cmd) {
            var vm = this;
            var postdata = { car_id: row.car, status: cmd, contract_id: row.id };
            utils.fetch("/car/nolock", { method: "POST", body: postdata }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.$message({ showClose: true, type: "success", message: json.message });
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        setLock: function(row, cmd) {
            var vm = this;
            var postdata = { car_id: row.car, cmd: cmd, contract_id: row.id };
            utils.fetch("/car/handle", { method: "POST", body: postdata }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.remoteInfo = { show: true, cmd: cmd, title: json.content.title };
                        vm.remoteInfo.info = json.content.info == false || json.content.info == "" ? { url: "", params: "", result: "" } : json.content.info;
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        allChangeLog: function() {
            var r = { path: "/contract/allchangelog" };
            this.$router.push(r);
        },
        getLockedLog: function() {
            var r = { path: "/car/operation" };
            this.$router.push(r);
        },
        getHistory: function(row) {
            var vm = this;
            vm.opHistory.title = "月卡操作历史记录";
            vm.dialogPagination.page = 1;
            vm.dialogPagination.pagesize = 20;
            vm.opHistory.show = true;
            vm.activeId = row.id;
            vm.getDialogData();
        },
        getDialogData: function() {
            var vm = this;
            vm.hasCase = false;
            vm.opHistory.loading = true;
            var url = "/contract/operateHistory?page=" + vm.dialogPagination.page + "&pagesize=" + vm.dialogPagination.pagesize + "&contract_id=" + vm.activeId;
            utils.fetch(url).then(function(res) {
                vm.opHistory.data =
                    typeof res != "undefined" && res.code == 0 && res.content != ""
                        ? res.content.data.map(function(i) {
                              return Object.defineProperty(i, "show", {
                                  //todo
                                  value: false,
                                  writable: true,
                                  enumerable: true,
                                  configurable: true
                              });
                          })
                        : [];
                vm.dialogPagination.total = typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
                vm.opHistory.loading = false;
                if (vm.opHistory.data.length == 0) {
                    vm.hasCase = true;
                }
            });
        },
        getPlateLog: function(row) {
            var vm = this;
            vm.changePlateLog.title = "更换车牌信息日志";
            vm.changePlateLog.show = true;
            vm.changePlateLog.loading = true;
            utils.fetch("/contract/checkChangePlate", { method: "POST", body: { contract_id: row.id } }).then(function(res) {
                vm.changePlateLog.data = typeof res != "undefined" && res.code == 0 && res.content != "" ? res.content : [];
                vm.changePlateLog.loading = false;
            });
        },
        changePlateShow: function(index, row) {
            var vm = this;
            vm.changePlate.info.oldPlate = row.plates[0].car_id;
            vm.changePlate.info.newPlate = "";
            vm.changePlate.info.station = row.station;
            vm.changePlate.info.contract_id = row.id;
            vm.changePlate.title = "更换车牌信息";
            vm.changePlate.show = true;
        },
        changePlateSubmit: function() {
            var vm = this;
            if (vm.changePlate.info.newPlate == "") {
                vm.$message({ showClose: true, message: "新车牌号不能为空", type: "error" });
                return;
            }
            var editData = {
                station_id: vm.changePlate.info.station,
                contract_id: vm.changePlate.info.contract_id,
                new_car: vm.changePlate.info.newPlate
            };
            vm.changePlate.submitBtn = true;
            utils.fetch("/contract/changePlate", { method: "POST", body: editData }).then(function(res) {
                if (typeof res != "undefined") {
                    vm.changePlate.submitBtn = false;
                    if (res.code == 0) {
                        vm.changePlate.show = false;
                        vm.showPlateInfo(res);
                        vm.getData();
                    } else {
                        vm.changePlate.info.newPlate = "";
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        showPlateInfo: function(res) {
            var vm = this;
            vm.plateInfo.title = "月卡下发和删除信息";
            vm.plateInfo.show = true;
            vm._resetShow();
            vm.plateInfo.delShow = true;
            vm.plateInfo.add = res.content.add;
            vm.plateInfo.del = res.content.del;
        },
        addBuildSearch(){
            const buildSearch = this.$refs.buildSearch
            const data = buildSearch.$data
            this.search.build_id = data.build_id
            this.search.unitname = data.unitname
            this.search.floor = data.floor
            this.search.room_name = data.room_name
        },
        checkSearch() {
            const search = this.search
            //处理搜索条件中的关联限制
            if (search.position && !search.station_id) {
                this.$message({
                    showClose: true,
                    message: "查询车位需选择停车场",
                    type: "error"
                });
                return false;
            }

            if(search.floor && !(search.unitname && search.build_id)){
                 this.$message({
                    showClose: true,
                    message: "查询楼层必须选择单元和楼栋",
                    type: "error"
                });
                return false;
            }
            if(search.unitname && !search.build_id){
                 this.$message({
                    showClose: true,
                    message: "查询单元必须选择楼栋",
                    type: "error"
                });
                return false;
            }
            if(search.room_name && !search.station_id){
                 this.$message({
                    showClose: true,
                    message: "查询房间号必须选择停车场",
                    type: "error"
                });
                return false;
            }

            return true;
        },
        getData() {
            const {queryFlag} = this.$route.params;
            if (queryFlag && queryFlag === 'fastQuery') {
                this.search = {};
            }
            var url = "/contract/lists?page=" + this.pagination.page + "&pagesize=" + this.pagination.pagesize;
            let { dept, ...others } = utils.dealRouteParams(this);
            var querystr = utils.setQueryString(others);
            url += querystr ? "&" + querystr : "";
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? "&" + deptStr : "";
            this.shade = true;
            utils.fetch(url).then((json) => {
                this.clearRouteParams();
                if (typeof json != "undefined" && json.code == 0 && json.content && Array.isArray(json.content.lists) && json.content.lists.length > 0) {
                    let tableDatas = json.content.lists.map(item => {
                        item.expanded = false;
                        item.car_hasimgs = false;
                        item.build_list = {};
                        return item;
                    });
                    this.tableData = tableDatas;
                    this.pagination.total = json.content.total;
                } else {
                    vm.tableData = [];
                    vm.pagination.total = 0;
                    this.$message({ showClose: true, message: json.message, type: 'error' })
                }
                this.shade = false;
            }).then(() => {
                //更新列表时   如果有楼栋搜索条件  更新楼栋数据
                if(!this.search.station_id){
                    return
                }
                const buildSearch = this.$refs.buildSearch
                buildSearch.getBuildLists()
                if(this.search.build_id && this.search.unitname){
                    buildSearch.getRoomLists()
                }
                
            });
        },
        btnSearch() {
            this.addBuildSearch()
            if (this.checkSearch()) {
                this.pagination.page = 1;
                this.getData();
            }
        },
        btnUndo: function() {
            this.search = { station_id: "", dept: "", car_id: "", m_car: "", username: "", phone: "", status: "", type: "", rule_id: "", is_expired: "", property_id: "", unit_name: "", room_name: "" };
            this.$refs.buildSearch.$data.room_name = "" //单独清空房间,其他参数的清空有组件内部的机制处理
            this.clearRouteParams();
            this.rulesInStation = [];
            this.ruleSearch = { show: false, loading: false };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.$route.params.station_id = "";
            this.getData();
        },
        SelectUpdateStation: function(obj) {
            // this.edit.data.rule_id = '';
            var vm = this;
            if (this.edit.data.id == 0) {
                vm.getRulesLoading = true;
                utils.getRulesByStationID(vm.edit.data.station_id).then(function(arr) {
                    vm.getRulesLoading = false;
                    if (arr && Array.isArray(arr)) {
                        vm.rulesInStation = arr.filter(item => item.status === "Y");
                    }
                });
            }
        },
        contractImport: function() {
            this.$router.push({ path: "/contract/import" });
        },
        addClick: function() {
            this.space.type = "add";
            this.edit = { title: "月卡添加", show: true, rules: [], data: { id: 0, type: 0, station_type: 0, station_id: 0, car_id: 0, mobile: "", plates: [{ car_id: "" }], time_begin: "", time_end: "", rule_id: "", position: "", inside: 0, visiable: "Y", space: 1 } };
            this.rulesInStation = [];
        },
        updateClick(index, row) {
            this.space.type = "edit";
            var vm = this;
            vm.getRulesLoading = true;
            utils
                .getRulesByStationID(row.station)
                .then(function(arr) {
                    vm.getRulesLoading = false;
                    vm.rulesInStation = arr.filter(item => item.status === "Y");
                })
                .catch(e => {
                    console.log("getRulesByStationID error", e);
                });
            this.edit = {
                title: "月卡编辑",
                show: true,
                rules: [],
                data: {
                    id: row.id,
                    type: row.type,
                    station_id: row.station,
                    station_type: row.station_type,
                    car_id: row.car,
                    mobile: row.phone,
                    plates: [{ car_id: "" }],
                    room: row.room_name,
                    position: row.position,
                    unit: row.unit_name,
                    time_begin: row.time_begin.substr(0, 10),
                    time_end: row.time_end.substr(0, 10),
                    rule_id: row.rule,
                    visiable: row.visiable,
                    inside: row.inside,
                    space: row.space,
                    eopen: row.eopen,
                    status: "",
                    name: row.username
                }
            };
            if (row.plates.length > 0) {
                vm.edit.data.carids = row.plates.map(i => i.car_id).join(",");
            }
            if (row.plates.length > 0) {
                this.edit.data.plates = row.plates
                    .filter(function(k) {
                        return parseInt(k.is_master) == 0;
                    })
                    .map(function(k) {
                        return { car_id: k.car_id };
                    });
                if (this.edit.data.plates.length == 0) {
                    this.edit.data.plates = [{ car_id: "" }];
                }
            }
        },
        async submitOk(key) {
            //提交
            var vm = this;
            var edit = vm.edit.data;

            if (edit.daterange == "") {
                vm.$message({ showClose: true, message: "有效期不能为空", type: "error" });
                return;
            }
            if (edit.mobile == "") {
                vm.$message({ showClose: true, message: "手机号不能为空", type: "error" });
                return;
            }
            var sub_cars = "";
            if (edit.plates.length > 0) {
                for (var i in edit.plates) {
                    sub_cars += (sub_cars == "" ? "" : ",") + edit.plates[i].car_id;
                }
            }
            if (typeof sub_cars != "undefined" && new RegExp("," + edit.car_id + ",").test("," + sub_cars + ",")) {
                vm.$message({ showClose: true, message: "副车牌不能与主车牌相同", type: "error" });
                return;
            }
            var url = "";
            let { type, station_id, rule_id, position, room, unit, time_begin, time_end, mobile, visiable, space, status, inside, name } = edit;
            let data = { type, station_id, rule_id, position, room, unit, time_begin, time_end, mobile, visiable, space, status, inside, name };
            data.sub_cars = sub_cars;

            let loading = this.$loading({
                lock: true,
                text: "正在提交...",
                background: "rgba(0, 0, 0, 0.7)",
                fullscreen: true
            });

            if (edit.id) {
                //编辑
                url = "/contract/update";
                data.id = edit.id;
                data.eopen = edit.eopen;
                let result1 = await this.$refs.truckspace.doSubmit();
                if (!result1) {
                    loading.close();
                    return false;
                }
                data.space = this.$refs.truckspace.spaceLists.length;
                data.inside = this.$refs.truckspace.inside;
            } else {
                // 新增
                url = "/contract/add";
                data.id = edit.id;
                data.car_id = edit.car_id;
                edit.carids = edit.car_id;
                data.space = 1;
            }

            utils.fetch(url, { method: "POST", body: data }).then(json => {
                loading.close();
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        if (key == 1) {
                            if (data.status === "canceled") {
                                vm.delClick({ car: edit.carids, rule: edit.rule_id, station: edit.station_id }, true); //删除下发
                            } else {
                                vm.sendClick({ car: edit.car_id, cars: edit.carids, rule: edit.rule_id, station: edit.station_id, station_type: edit.station_type, inside: edit.inside }); //下发到厂家
                            }
                        } else {
                            vm.getData();
                            vm.edit.show = false;
                            vm.$message.success("提交成功！");
                        }
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        updateClientClick: function(row) {
            var vm = this;
            vm.getRulesLoading = true;
            utils.getRulesByStationID(row.station).then(function(arr) {
                vm.getRulesLoading = false;
                vm.rulesInStation = arr;
            });
            vm.clientInfo = {
                title: "基本信息编辑",
                show: true,
                rules: [],
                data: {
                    id: row.id,
                    station_id: row.station,
                    station_type: row.station_type,
                    name: row.username,
                    mobile: row.phone,
                    room: row.room_name,
                    position: row.position,
                    unit: row.unit_name,
                    rule_id: row.rule,
                    visiable: row.visiable,
                    inside: row.inside,
                    type: row.type,
                    rule_N1: row.rule_N1,
                    time_begin: row.time_begin.substr(0, 10),
                    time_end: row.time_end.substr(0, 10),
                    car_id: row.car,
                    status: ""
                }
            };
            this.space.type = "info";
            if (row.plates.length > 0) {
                vm.clientInfo.data.carids = row.plates.map(i => i.car_id).join(",");
            }
        },
        async submitClientInfo(key) {
            //基本信息提交
            var vm = this;
            var clientInfo = vm.clientInfo.data;
            if (clientInfo.mobile == "") {
                vm.$message({ showClose: true, message: "手机号不能为空", type: "error" });
                return;
            }
            var url = "/contract/basicInfo";
            let { ...data } = clientInfo;

            const loading = this.$loading({
                lock: true,
                text: "正在提交...",
                background: "rgba(0, 0, 0, 0.7)"
            });
            let result = await this.$refs.truckSpaceBaseInfo.doSubmit();
            if (!result) {
                loading.close();
                return false;
            }
            data.space = this.$refs.truckSpaceBaseInfo.spaceLists.length;
            data.inside = this.$refs.truckSpaceBaseInfo.inside;
            utils.fetch(url, { method: "POST", body: data }).then(function(json) {
                loading.close();
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        if (key === 1) {
                            if (data.status === "canceled") {
                                vm.delClick({ car: clientInfo.carids, rule: clientInfo.rule_id, station: clientInfo.station_id }, true); //删除下发
                            } else {
                                vm.sendClick({ car: clientInfo.car_id, cars: clientInfo.carids, rule: clientInfo.rule_id, station: clientInfo.station_id, station_type: clientInfo.station_type, inside: clientInfo.inside }); //下发到厂家
                            }
                        } else {
                            vm.getData();
                            vm.clientInfo.show = false;
                            this.$message.success("提交成功！");
                        }
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        delClick: function(row, flag) {
            //删除
            //this.confirmBtn('del',row,"车辆将会使用临停规则进出,您确定要删除月卡： ",'正在删除...');
            var vm = this;
            vm.delCmd(row, flag);
        },
        delCmd: function(row, flag) {
            var vm = this;
            this.$store.commit("loading", true);
            this.remoteInfo = { show: false, cmd: "", title: "", info: {} };
            var url = "/contract/delcard?station_id=" + row.station + "&car_id=" + row.car + "&rule_id=" + row.rule;
            if (flag) url += "&is_deleted=N";
            return utils.fetch(url).then(function(json) {
                vm.$store.commit("loading", false);
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.$message({ showClose: true, message: json.message, type: "success" });
                        vm.getData();

                        vm.edit.show = false;
                        vm.clientInfo.show = false;
                        this.$message.success("提交成功！");
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        remoteShow: function(index, row) {
            //查看本地
            var vm = this;
            vm.localData.show = true;
            this.oneCommond(row, "search");
        },
        sendClick: function(row) {
            //发送厂家
            let vm = this;
            vm.localData.show = false; //隐藏查看本地返回结果表格
            vm.oneCommond(row, "add", () => {
                if (row.inside > 0) {
                    if (row.plates && row.plates.length > 0) {
                        row.car = row.plates.map(i => i.car_id).join(",");
                    } else {
                        row.car = row.cars;
                    }
                    vm.oneCommond(row, "snumber");
                }
            });
        },
        lockClick: function(row) {
            //禁用
            this.confirmBtn("disable", row, "车辆将会使用临停规则进出,您确定要禁用月卡： ", "正在禁用...");
        },
        unlockClick: function(row) {
            //启用
            this.confirmBtn("enable", row, "车辆将不再使用临停规则而使用月卡进出,您确定要启用月卡： ", "正在启用...");
        },
        remoteClose: function() {
            this.getData();
        },
        confirmBtn: function(cmd, row, titleTxt, doingTxt) {
            var vm = this;
            var plate = row.plates
                .map(function(k) {
                    return k.plate;
                })
                .join(",");
            vm.localData.show = false; //隐藏查看本地返回结果表格
            this.$msgbox({
                title: "提示",
                message: titleTxt + row.station_name + " - " + plate,
                showCancelButton: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: function(action, instance, done) {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = doingTxt;
                        vm.oneCommond(row, cmd);
                        instance.confirmButtonLoading = false;
                        done();
                    } else {
                        done();
                    }
                }
            });
        },
        oneCommond: function(row, cmd, cb) {
            var vm = this;
            this.$store.commit("loading", true);
            this.remoteInfo = { show: false, cmd: "", title: "", info: {} };
            var url = "/contract/commond?cmd=" + cmd + "&station_id=" + row.station + "&car_id=" + row.car;
            if (cmd === "snumber") {
                //contract/commond?cmd=snumber&station_id=1749&car_id=14524063&sid=2&number=2
                url += "&sid=2&number=" + row.inside;
            } else {
                url += "&rule_id=" + row.rule;
            }
            return utils.fetch(url).then(function(json) {
                vm.$store.commit("loading", false);
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.remoteInfo = { show: true, cmd: cmd, title: json.content.title, info: json.content.info };
                        //查看本地返回表格记录
                        vm.localData.data = json.content.getDates ? json.content.getDates : [];
                        cb && cb();

                        vm.getData();
                        vm.edit.show = false;
                        vm.clientInfo.show = false;
                        this.$message.success("提交成功！");
                    } else {
                        console.log("下发失败");
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },

        platesfmtrow: function(rowData) {
            var d = rowData.map(function(k, i) {
                return k.plate;
            });

            return d.join(",");
        },
        cutPlate(itemData) {
            let oPlate = itemData.map(item => {
                return item.plate;
            });
            if (oPlate.length > 10) {
                oPlate.length = 10;
                return oPlate.join(",") + "...";
            } else {
                return oPlate.join(",");
            }
        },
        showMorePlate(rowData) {
            this.isMorePlate = true;
            this.allPlateData = rowData;
            let tempData = rowData.plates.map((item, index) => {
                return {
                    ...item,
                    color: !!rowData.colours[index].colour ? rowData.colours[index].colour : "未知",
                    model: !!rowData.models[index].model ? rowData.models[index].model : "未知"
                };
            });
            this.morePlateData = tempData;
        },
        addSubPlate: function() {
            this.edit.data.plates.push({ car_id: "" });
        },
        removeSubPlate: function(index) {
            this.edit.data.plates.splice(index, 1);
        },
        statusFmt: function(cellValue, time_end) {
            if (cellValue == "canceled") {
                return '<span style="color:red;font-style:italic">已取消</span>';
            } else if (cellValue == "created") {
                return "已创建";
            } else if (cellValue == "locked") {
                return '<span style="color:grey;font-style:italic">已禁用</span>';
            } else if (cellValue == "working") {
                return "使用中";
            } else {
                return cellValue;
            }
        },
        statusFmt_timeend(time) {
            var end = new Date(time);
            var now = new Date();
            if (end.getTime() < now.getTime()) {
                return '<span class="red">' + time + "</span>";
            } else {
                return "<span>" + time + "</span>";
            }
        },
        authCheck: function(tag) {
            return utils.authCheck(this, tag);
        },
        editCarInfo(row) {
            this.isShowEditCarInfo = true;
            if (row.plates) {
                for (let i = 0; i < row.plates.length; i++) {
                    if (row.plates[i].is_master === 1) {
                        this.curCarInfo.car_plate = row.plates[i].plate;
                    }
                }
            }
            this.curCarInfo.car_brand = row.car_brand || "";
            this.curCarInfo.car_type = row.car_type || "";
            this.curCarInfo.car_serial = row.car_serial || "";
            this.curCarInfo.car_color = row.car_color || "";
        },
        getBrandId() {
            let getBrandListUrl = "/car/information?action=brand";
            return utils.fetch(getBrandListUrl).then(res => {
                if (res && res.code === 0 && res.content) {
                    let tempList = res.content.lists || [];
                    for (let brandInfoItem of tempList) {
                        if (brandInfoItem.name === this.curCarInfo.car_brand) {
                            return brandInfoItem.id;
                        }
                    }
                }
            });
        },
        getCarTypeId() {
            let getCarTypeListUrl = "/car/information?action=type";
            return utils.fetch(getCarTypeListUrl).then(res => {
                if (res && res.code === 0 && res.content) {
                    let tempList = res.content.lists || [];
                    for (let typeInfoItem of tempList) {
                        if (typeInfoItem.name === this.curCarInfo.car_type) {
                            return typeInfoItem.id;
                        }
                    }
                }
            });
        },
        getCarColorId() {
            let getCarColorListUrl = "/car/information?action=color";
            return utils.fetch(getCarColorListUrl).then(res => {
                if (res && res.code === 0 && res.content) {
                    let tempList = res.content.lists || [];
                    for (let colorInfoItem of tempList) {
                        if (colorInfoItem.name === this.curCarInfo.car_color) {
                            return colorInfoItem.id;
                            // resolve(colorInfoItem.id)
                            // break
                        }
                    }
                }
            });
        },
        getCarSerialId() {
            let getCarSerialListUrl = "/car/information?action=serial";
            return utils.fetch(getCarSerialListUrl).then(res => {
                if (res && res.code === 0 && res.content) {
                    let tempList = res.content.lists || [];
                    for (let serialInfoItem of tempList) {
                        if (serialInfoItem.name === this.curCarInfo.car_serial) {
                            return serialInfoItem.id;
                        }
                    }
                }
            });
        },
        initCarInfo(type) {
            if (type === "brand") {
                this.carBrandList = [];
            } else if (type === "type") {
                this.carTypeList = [];
            } else if (type === "serial") {
                this.carSerialList = [];
            } else if (type === "color") {
                this.carColorList = [];
            }
        },
        addItemToCarList(type, item) {
            if (type === "brand") {
                this.carBrandList.push(item);
            } else if (type === "type") {
                this.carTypeList.push(item);
            } else if (type === "serial") {
                this.carSerialList.push(item);
            } else if (type === "color") {
                this.carColorList.push(item);
            }
        },
        async getCarInfo(query, type) {
            this.curCarInfoLoading = true;
            let url = "/car/information?action=" + type;
            if (query) {
                url = url + "&name=" + encodeURIComponent(query);
            }
            if (type === "serial") {
                if (this.curCarInfo.car_brand) {
                    // 如果车牌记录的不是brand_id而是name，那么要先获取到该name对应的brand_id，car_type同理
                    if (isNaN(parseInt(this.curCarInfo.car_brand))) {
                        let brandId = await this.getBrandId();
                        url = url + "&brand_id=" + brandId;
                    } else {
                        url = url + "&brand_id=" + this.curCarInfo.car_brand;
                    }
                }
                if (this.curCarInfo.car_type) {
                    if (isNaN(parseInt(this.curCarInfo.car_type))) {
                        let carTypeId = await this.getCarTypeId();
                        url = url + "&type=" + carTypeId;
                    } else {
                        url = url + "&type=" + this.curCarInfo.car_type;
                    }
                }
            }
            if (this.timer) {
                clearTimeout(this.timer);
            }
            // HTTP请求防抖处理
            this.timer = setTimeout(() => {
                utils
                    .fetch(url)
                    .then(res => {
                        if (res && res.code === 0 && res.content) {
                            this.initCarInfo(type);
                            let tempList = res.content.lists || [];
                            for (let carInfoItem of tempList) {
                                let tempObj = { label: "", value: "" };
                                tempObj.label = carInfoItem.name || "";
                                tempObj.value = "" + carInfoItem.id;
                                this.addItemToCarList(type, tempObj);
                            }
                            // this.carInfoList = res.content.lists || []
                            // console.log('res', res)
                        } else {
                            this.$message({ showClose: true, message: json.message, type: "error" });
                        }
                    })
                    .then(res => {
                        this.curCarInfoLoading = false;
                    })
                    .catch(e => {
                        console.log("getCarInfo error", e);
                    });
            }, 1000);
        },
        verifyCarInfo() {
            if (!this.curCarInfo.car_plate) {
                this.$message.error("车牌号不能为空！");
                return false;
            } else if (!this.curCarInfo.car_serial) {
                this.$message.error("车辆型号不能为空！");
                return false;
            }
            return true;
        },
        async saveCarInfo() {
            if (this.verifyCarInfo()) {
                this.saveCarInfoLoading = true;
                let url = "/car/updateInfo";
                let color = this.curCarInfo.car_color;
                let serial = this.curCarInfo.car_serial;
                // 如果传入的color不是id，则先获取color_id,car_serial同理
                if (isNaN(parseInt(this.curCarInfo.car_color))) {
                    color = await this.getCarColorId();
                }
                if (isNaN(parseInt(this.curCarInfo.car_serial))) {
                    serial = await this.getCarSerialId();
                }
                let { ...data } = { plate: this.curCarInfo.car_plate, serial, color };
                utils
                    .fetch(url, { method: "POST", body: data })
                    .then(res => {
                        if (res && res.code === 0 && res.message === "success") {
                            this.$message.success("修改车辆信息成功！");
                            this.isShowEditCarInfo = false;
                            this.getData();
                        } else {
                            this.$message({ showClose: true, message: json.message, type: "error" });
                        }
                        this.saveCarInfoLoading = false;
                    })
                    .catch(e => {
                        this.saveCarInfoLoading = false;
                        console.log("saveCarInfo error", e);
                    });
            }
        },
        handleSubmitOver(val) {
            this.space.isSubmit = val;
        },
        clearRouteParams(){
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }   
        }
    },
    watch: {
        "curCarInfo.car_brand": {
            handler(nVal, oVal) {
                if (oVal) {
                    this.curCarInfo.car_serial = "";
                }
            },
            deep: true
        },
        "curCarInfo.car_type": {
            handler(nVal, oVal) {
                if (oVal) {
                    this.curCarInfo.car_serial = "";
                }
            },
            deep: true
        },
        isShowEditCarInfo(nVal, oVal) {
            if (!nVal) {
                this.curCarInfo = { car_plate: "", car_brand: "", car_type: "", car_serial: "", car_color: "" };
            }
        }
        
    },
    created() {
        utils.getTingYunScript();
        this.getData();
    },
    activated() {
        if (Object.keys(this.$route.params).length > 0) {
            this.getData();
        }
    },
    deactivated() {
        this.getData();
    }
};
</script>
<style lang="scss">
.month-card {
    .car-info-wrapper {
        width: 80%;
        margin: 0 auto;

        .car-info {
            margin-bottom: 10px;

            .el-input--suffix .el-input__inner {
                height: 35px;
            }
        }
        .btn-save {
            margin-left: 72px;
        }
    }
}
</style>
