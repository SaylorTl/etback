<template>
    <div id='box' class="menu-hide">
        <div class="mainbox ptb10">
            <section class="service_section mt10">
                <h2>接听概况</h2>
                <div class="service_infoBox">
                    <div class="info_lists">
                        <div class="list_item widthP50">
                            <span class="item_key">来电:</span>
                            <span class="item_val">{{customer.phone}}</span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="service_section mt10">
                <h2>关键信息</h2>
                <div class="service_infoBox">
                    <div class="search_box">
                        <div class="search_box_item">
                            <el-input v-model.trim="search.phone" size="small" class="widthX200" placeholder="手机号" clearable></el-input>
                        </div>
                        <div class="search_box_item">
                            <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场" v-if='stationslist'></my-select-station>
                            <el-select v-if='!stationslist' v-model="search.station" size="small" class="cell widthX150" placeholder="车场列表" clearable @change="changeSelect($event,'1')">
                                <el-option v-for="(item,index) in stations" :key="index" :label="item.station_name" :value="item.station"></el-option>
                            </el-select>
                            <el-button @click="changeInput('1')" size="small">手动输入车场</el-button>
                        </div>
                        <div class="search_box_item">
                            <my-select-plate v-if='plateslist' v-model="search.car_id" size="small" class="cell widthX150" placeholder="输入车牌"></my-select-plate>
                            <el-select v-if='!plateslist' v-model="search.car_id" size="small" class="cell widthX150" placeholder="车牌列表" clearable @change="changeSelect($event,'2')">
                                <el-option v-for="(item,index) in plates" :key="index" :label="item.plate" :value="item.car_id"></el-option>
                            </el-select>
                            <el-button @click="changeInput('2')" size="small">手动输入车牌</el-button>
                        </div>
                        <!-- 开闸的时候用得到 -->
                        <!-- <el-select v-model="search.device_id" size="small" class="search_box_item widthX200" placeholder="选择出入口" @change=''>
                            <el-option v-for="(item,index) in devices" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select> -->
                        <!-- <el-select v-if="plates.length>1" v-model="search.plate" size="small" class="search_box_item widthX200" placeholder="选择车牌" @change=''>
                            <el-option v-for="item in plates" :key="item.car_id" :label="item.plate" :value="item.car_id"></el-option>
                        </el-select> -->
                        <div class="search_box_item">
                            <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                            <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                        </div>
                    </div>
                </div>
            </section>
            <section class="service_section mt10">
                <h2>车辆信息</h2>
                <div class=" service_infoBox">
                <div class="info_lists" v-loading='searchLoading'>
                    <div class="list_item widthP50">
                        <span class="item_key">停车场:</span>
                        <span class="item_val">{{carData.station_name}}
                                <!-- <el-select v-model="carData.station" size="small" class="cell widthX200" placeholder="车场列表" @change='changeStationid'>
                                    <el-option v-for="(item,index) in stations" :key="index" :label="item.station_name" :value="item.station"></el-option>
                                </el-select> -->
                            </span>
                        <!-- <span class="item_val" v-else>{{carData.station_name}}</span> -->
                    </div>
                    <div class="list_item widthP50">
                        <span class="item_key">车牌号:</span>
                        <span class="item_val">{{carData.plate}}
                                 <!-- <el-select v-model="carData.car_id" size="small" class="cell widthX200" placeholder="车牌列表" @change='changeCarid'>
                                    <el-option v-for="(item,index) in plates" :key="index" :label="item.plate" :value="item.car_id"></el-option>
                                </el-select> -->
                            </span>
                        <!-- <span class="item_val" v-else>{{carData.plate}}</span> -->
                    </div>
                    <div class="list_item widthP50" v-if="carData.isMonth ==='Y'||carData.isMonth ==='N'">
                        <span class="item_key">是否月卡:</span>
                        <span class="item_val">{{cfg.month[carData.isMonth]}}
                            <el-button v-if="carData.isMonth==='N'&&!!carData.car_id" size="mini" @click='showApplyDetail'>月卡申请查看</el-button></span>
                    </div>
                    <!-- 月卡 不管过不过期 -->
                    <template v-if='carData.isMonth === "Y"'>
                        <div class="list_item widthP50">
                            <span class="item_key">月卡状态:</span>
                            <span class="item_val">{{cfg.status[carData.status]}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">月卡规则:</span>
                            <span class="item_val">{{carData.rule_name}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">月卡有效期:</span>
                            <span class="item_val">{{carData.time_begin+ '——' +carData.time_end}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">是否过期:</span>
                            <span class="item_val">{{cfg.expiredStatus[carData.is_expired]}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">限制信息:</span>
                            <span class="item_val">
                                    <el-button size="mini"  @click='showPayLimit("1")'>停车场缴费限制</el-button>
                                    <el-button size="mini"  @click='showPayLimit("2")'>月卡规则限制</el-button>
                                    <el-button size="mini"  @click='showPayLimit("3")'>月卡缴费限制</el-button>
                                </span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">车辆状态:</span>
                            <span class="item_val">{{cfg.reason[carData.reason]}}</span>
                        </div>
                    </template>
                    <!-- 临停 不管原因 -->
                    <template v-if='carData.isMonth === "N" &&carData.reason != "noplate"'>
                        <div class="list_item widthP50">
                            <span class="item_key">停车时长:</span>
                            <span class="item_val">{{payInfo.parktime}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">停车费用:</span>
                            <span class="item_val">{{payInfo.money+'元'}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">优惠金额:</span>
                            <span class="item_val">{{payInfo.free+'元'}}</span>
                            <span class="item_val" v-if='payInfo.free>0'><el-button size="mini" @click='couponshow'>查看详情</el-button></span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">应付费用:</span>
                            <span class="item_val">{{payInfo.total+'元'}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">缴费状态:</span>
                            <span class="item_val">{{cfg.ispayStatus[payInfo.status]||'未知'}}</span>
                        </div>
                    </template>
                    <!-- 无牌车  -->
                    <template v-if='carData.reason === "noplate"'>
                        <div class="list_item widthP50">
                            <span class="item_key">进场道闸:</span>
                            <span class="item_val">{{carData.device_name}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">进场时间:</span>
                            <span class="item_val">{{carData.enter_time}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">出场道闸:</span>
                            <span class="item_val">{{carData.device_out_name}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">出场时间:</span>
                            <span class="item_val">{{carData.out_time}}</span>
                        </div>
                        <div class="list_item widthP50">
                            <span class="item_key">无牌车状态:</span>
                            <span class="item_val">{{cfg.isInOutStatus[carData.noplate_status]||'未知'}}</span>
                        </div>
                        <template v-if='noplate_cost'>
                            <div class="list_item widthP50">
                                <span class="item_key">停车时长:</span>
                                <span class="item_val">{{payInfo.parktime}}</span>
                            </div>
                            <div class="list_item widthP50">
                                <span class="item_key">停车费用:</span>
                                <span class="item_val">{{payInfo.money+'元'}}</span>
                            </div>
                            <div class="list_item widthP50">
                                <span class="item_key">优惠金额:</span>
                                <span class="item_val">{{payInfo.free+'元'}}</span>
                                <span class="item_val" v-if='payInfo.free>0'><el-button size="mini" @click='couponshow'>查看详情</el-button></span>
                            </div>
                            <div class="list_item widthP50">
                                <span class="item_key">应付费用:</span>
                                <span class="item_val">{{payInfo.total+'元'}}</span>
                            </div>
                            <div class="list_item widthP50">
                                <span class="item_key">缴费状态:</span>
                                <span class="item_val">{{cfg.ispayStatus[payInfo.status]||'未知'}}</span>
                            </div>
                        </template>
                    </template>
                    <div class="list_item widthP50" v-if='carData.reason != "noplate"'>
                        <span class="item_key">最近一次进场时间:</span>
                        <span class="item_val">{{carData.lastest}}</span>
                        <span class="item_val" v-show='carData.car_id'><el-button size="mini" @click='imgshow'>进场图片查看</el-button></span>
                    </div>
                    <div class="list_item widthP50" v-if='payInfo.total==0||carData.isMonth === "Y"||carData.reason === "noplate"'>
                        <span class="item_key">选择道闸:</span>
                        <span class="item_val">
                                <el-select v-model="carData.device_id" size="mini" class="search_box_item widthX200" placeholder="选择道闸">
                                    <el-option v-for="(item,index) in devices" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </span>
                        <span class="item_val"><el-button size="mini" type="primary" @click='openDevice'>开闸放行</el-button></span>
                    </div>
                </div>
        </div>
        </section>
        <section class="service_section mt10">
            <h2>最近半年缴费信息</h2>
            <div class="service_infoBox payinfo_box">
                <el-table v-loading="recordShade" element-loading-text="拼命加载中" :data="recordData" border class='mb10'>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="支付来源:">
                                     <span>{{cfg.source[props.row.source]||props.row.source}}</span>
                                </el-form-item>
                                <el-form-item label="供应商:"><span>{{ props.row.vendor_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="用户名:"><span>{{ props.row.user_name }}</span></el-form-item>
                                <el-form-item label="第三方单号:"><span>{{ props.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ props.row.related_tnum }}</span></el-form-item>
                                 <el-form-item v-if='!!props.row.cost_price' :label="props.row.discount_type+'/原价:'"><span>{{props.row.cost_price}} </span></el-form-item>
                                <el-form-item label="月卡价格:" v-if="props.row.type == 'MONTH'"><span>{{ props.row.rent }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="手机号:"><span>{{ props.row.user_phone }}</span></el-form-item>
                                <el-form-item v-if="props.row.source == 'WECHAT' || props.row.source == 'WX_AGUA'" label="微信openID:"><span>{{ props.row.user_openid }}</span></el-form-item>
                                <el-form-item label="月卡规则:"><span>{{ props.row.rule_name }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                                <el-form-item label="开票状态:" ><span>{{cfg.invoice[props.row.invoice]}}</span></el-form-item>
                                <el-form-item v-if="props.row.type == 'MONTH'" label="购买时间段:"><span>{{ props.row.arrival + "    " + props.row.departure }}</span></el-form-item>
                                <el-form-item label="付款二维码:" v-if="props.row.qrcode">
                                    <qrcode :value="props.row.qrcode"></qrcode>
                                </el-form-item>
                                <div> <el-form-item v-if="props.row.download == 'N'" label="下发失败原因:"><span>{{ props.row.content }}</span></el-form-item></div>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="30"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" min-width="200"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="60"></el-table-column>
                    <el-table-column label="来源" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.source[scope.row.source]||scope.row.source}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" width="55">
                        <template slot-scope="scope">
                            <span>{{cfg.type[scope.row.type]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column prop="status" label="状态" width="88">
                        <template slot-scope="scope">
                            <span :class="{'green':scope.row.status == 'paid'}">{{cfg.status[scope.row.status]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="开闸/下发" min-width="65">
                        <template slot-scope="scope" v-if="scope.row.vendor_id != 0 && scope.row.status == 'paid'">
                            <span v-if='scope.row.type !== "BOOKING"' :class="{'red':scope.row.download == 'N'}">{{cfg.send[scope.row.type]+cfg.send[scope.row.download]}}</span>
                            <span v-else></span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="paytime" label="支付时间" min-width="140">
                        <template slot-scope="scope" v-show="scope.row.paytime">
                            <span v-if="scope.row.status == 'paid'">{{scope.row.paytime}}</span>
                            <span v-else>
                               <!--  <el-button @click="checkStatus(scope.row)" plain  size="mini"><i class="fa fa-pencil-square-o"></i>检测</el-button> -->
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
                <my-paginator v-if='recordData.length>0' class='tc' @change='setRecordPageData($event)' :pagination='recordPagination'></my-paginator>
                <div class="tc mt15">
                    <el-button size='small' type="primary" @click="goPaymentList">订单操作</el-button>
                </div>
            </div>
        </section>
         <section class="service_section mt10">
            <h2>问题处理</h2>
            <div class="service_infoBox payinfo_box">
                <h2>1. 月卡操作</h2>
                <el-table v-loading="contractShade" element-loading-text="拼命加载中" :data="contractData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="月卡ID:"><span>{{ props.row.id }}</span></el-form-item>
                                <el-form-item label="月卡金额:"><span>{{ props.row.rule_N1 }}</span></el-form-item>
                                <el-form-item label="用户姓名:"><span>{{ props.row.username }}</span></el-form-item>
                                <el-form-item label="用户手机:"><span>{{ props.row.phone }}</span></el-form-item>
                                <el-form-item label="车牌:" class="from_plates">
                                    <span v-for="(k,i) in props.row.plates" class="del-plate" :key="i">
                                        <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                        <el-tag v-else type="primary">副</el-tag>
                                        {{k.plate}}
                                        <i class="fa fa-close" @click='delPlate(k.plate,props.row)'></i>
                                    </span>
                                </el-form-item>
                                <el-form-item label="车型:" class="from_plates">
                                    <span v-for="(k,i) in props.row.models" :key="i">
                                        <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                        <el-tag v-else type="primary">副</el-tag>
                                        {{k.model||'未知'}}
                                    </span>
                                </el-form-item>
                                <el-form-item label="颜色:" class="from_plates">
                                    <span v-for="(k,i) in props.row.colours" :key="i">
                                        <el-tag v-if="k.is_master" type="danger">主</el-tag>
                                        <el-tag v-else type="primary">副</el-tag>
                                        {{k.colour||'未知'}}
                                    </span>
                                </el-form-item>
                                <el-form-item label="收费规则:"><span>{{ props.row.rule_name }}</span></el-form-item>
                                <el-form-item label="锁车状态:"><span>{{ props.row.lockStatus }}</span></el-form-item>
                                <el-form-item label="类型:">
                                    <span v-if="props.row.type == 0">一卡多车</span>
                                    <span v-if="props.row.type == 1">子母车</span>
                                </el-form-item>
                                <el-form-item label="最小缴费数:"><span>{{ props.row.rule_paymin }}</span></el-form-item>
                                <el-form-item label="最大缴费数:"><span>{{ props.row.rule_paymax }}</span></el-form-item>
                                <el-form-item label="规则类型:">
                                    {{cfg.ruleKind[props.row.rule_payunit]||'未知'}}
                                </el-form-item>
                                <el-form-item label="车位名称:"><span>{{ props.row.position }}</span></el-form-item>
                                <el-form-item label="车位数:"><span>{{ props.row.space }}</span></el-form-item>
                                <el-form-item label="添加时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="房号:"><span>{{ props.row.room_name }}</span></el-form-item>
                                <el-form-item label="楼栋号:"><span>{{ props.row.unit_name }}</span></el-form-item>
                                <el-form-item label="上次修改:"><span>{{ props.row.modifiedtime }}</span></el-form-item>
                            </el-form>
                             
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="40"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="145"></el-table-column>
                    <el-table-column prop="plates" label="车牌" :formatter="platesfmtrow" width="160"></el-table-column>
                    <el-table-column label="状态" min-width="60">
                        <template slot-scope="scope">
                            <div v-html="statusFmt(scope.row.status,scope.row.time_end)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="time_begin" label="开始时间" width="130"></el-table-column>
                    <el-table-column prop="time_end" label="结束时间" width="130">
                        <template slot-scope="scope">
                            <div v-html="statusFmt_timeend(scope.row.time_end)"></div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="service_infoBox payinfo_box">
                <h2>2. 续费申请审批</h2>
                <el-table v-loading="applyShade" element-loading-text="拼命加载中" :data="applyData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="申请人手机:"><span>{{ props.row.mobile }}</span></el-form-item>
                                <el-form-item label="申请人姓名:"><span>{{ props.row.mobile_name }}</span></el-form-item>
                                <el-form-item label="申请时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item v-if="props.row.type=='mon'" label="月卡类型:">
                                    <span v-if="props.row.cardtype==0">一卡多车</span>
                                    <span v-if="props.row.cardtype==1">字母车</span>
                                    <span v-if="props.row.owner==0">主卡</span>
                                    <span v-if="props.row.owner!=0">副卡</span>
                                </el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifiedtime }}</span></el-form-item>
                                <el-form-item label="车位编码:"><span>{{ props.row.position }}</span></el-form-item>
                                <el-form-item label="楼栋号:"><span>{{ props.row.unit_name }}</span></el-form-item>
                                <el-form-item label="房号:"><span>{{ props.row.room_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.state==2" label="拒绝理由:"><span>{{ props.row.detail }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column label="大区/事业部" width="220">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="carcode" label="车牌" width="90"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type=='mon' && scope.row.owner==0">主月卡</span>
                            <span v-if="scope.row.type=='mon' && scope.row.owner!=0">副月卡</span>
                            <span v-if="scope.row.type=='tmp'">临时</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.state==0">待审核</span>
                            <span v-if="scope.row.state==1" class="green" >已同意</span>
                            <span v-if="scope.row.state==2" class="red" >已拒绝</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="月卡使用人手机" min-width="110"></el-table-column>
                    <el-table-column prop="phone_name" label="月卡使用人姓名" min-width="90"></el-table-column>
                </el-table>
            </div>
        </section>
<!--         <section class="service_section mt10">
            <h2>设备/系统问题</h2>
            <div class="service_infoBox">
                <el-form :model="excepteForm" label-width="130px">
                    <el-form-item label="设备故障:">
                        <el-checkbox-group v-model="excepteForm.type">
                            <el-checkbox v-for="(v,k) in cfg.devicefaults" :label="k" :key="k">{{v}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="其它问题:">
                        <el-checkbox-group v-model="excepteForm.others">
                            <el-checkbox v-for="(v,k) in cfg.deviceothers" :label="k" :key="k">{{v}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
            </div>
        </section> -->
        <section class="service_section mt10">
            <h2>问题处理</h2>
            <div class="service_infoBox">
                <div class="operate_item">
                    <div class="o_text">1. 进/出场识别错误</div>
                    <div class="o_btn">
                        <el-button size="small" type="primary">修改车牌</el-button>
                    </div>
                </div>
                <div class="operate_item">
                    <div class="o_text">2. 临停退费问题</div>
                    <div class="o_btn">
                        <el-button size="small" type="primary">退费申请</el-button>
                    </div>
                </div>
            </div>
        </section>
        <section class="service_section mt10">
            <div class="cs_btn_box">
                <span class="closeSheet_Btn" @click='closeSheet'>关单</span>
            </div>
        </section>
        <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists>
        <el-dialog :title="commonDialog.title" :visible.sync="commonDialog.show" width="30%">
            <div>{{commonDialog.content}}</div>
            <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="commonDialog.show = false">确 定</el-button>
                </span>
        </el-dialog>
        <el-dialog :title="applyPopwin.title" :visible.sync="applyPopwin.show" width='80%'>
            <div class="payinfo_box">
                <el-table v-loading="applyShade" element-loading-text="拼命加载中" :data="applyData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="申请人手机:"><span>{{ props.row.mobile }}</span></el-form-item>
                                <el-form-item label="申请人姓名:"><span>{{ props.row.mobile_name }}</span></el-form-item>
                                <el-form-item label="申请时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item v-if="props.row.type=='mon'" label="月卡类型:">
                                    <span v-if="props.row.cardtype==0">一卡多车</span>
                                    <span v-if="props.row.cardtype==1">字母车</span>
                                    <span v-if="props.row.owner==0">主卡</span>
                                    <span v-if="props.row.owner!=0">副卡</span>
                                </el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifiedtime }}</span></el-form-item>
                                <el-form-item label="车位编码:"><span>{{ props.row.position }}</span></el-form-item>
                                <el-form-item label="楼栋号:"><span>{{ props.row.unit_name }}</span></el-form-item>
                                <el-form-item label="房号:"><span>{{ props.row.room_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.state==2" label="拒绝理由:"><span>{{ props.row.detail }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column label="大区/事业部" width="220">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="carcode" label="车牌" width="90"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type=='mon' && scope.row.owner==0">主月卡</span>
                            <span v-if="scope.row.type=='mon' && scope.row.owner!=0">副月卡</span>
                            <span v-if="scope.row.type=='tmp'">临时</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.state==0">待审核</span>
                            <span v-if="scope.row.state==1" class="green" >已同意</span>
                            <span v-if="scope.row.state==2" class="red" >已拒绝</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="月卡使用人手机" min-width="110"></el-table-column>
                    <el-table-column prop="phone_name" label="月卡使用人姓名" min-width="90"></el-table-column>
                </el-table>
            </div>
            <div class="tc mt15">
                <el-button size='small' type="primary" @click="goApplyList">月卡申请操作</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="stationPayDialog.title" :visible.sync="stationPayDialog.show" width="80%">
            <el-form>
                <el-form-item label="支付方式:" class="pay-way">
                    <div class="pay-way-item">
                        <div class="pay-way-title">彩支付:</div>
                        <el-checkbox-group v-model="stationPayDialog.pay_channel">
                            <el-checkbox v-for="item in stationPayDialog.payWay1" :value='item.value' :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="pay-way-item">
                        <div class="pay-way-title">ipos:</div>
                        <el-checkbox-group v-model="stationPayDialog.pay_channel">
                            <el-checkbox v-for="item in stationPayDialog.payWay2" :value='item.value' :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="pay-way-item">
                        <div class="pay-way-title">EP微信:</div>
                        <el-checkbox-group v-model="stationPayDialog.pay_channel">
                            <el-checkbox v-for="item in stationPayDialog.payWay3" :value='item.value' :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="pay-way-item">
                        <div class="pay-way-title">EP支付宝:</div>
                        <el-checkbox-group v-model="stationPayDialog.pay_channel">
                            <el-checkbox v-for="item in stationPayDialog.payWay4" :value='item.value' :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :title="rulePayDialog.title" :visible.sync="rulePayDialog.show" width="80%">
            <el-form>
                <el-form-item label="缴费渠道:">
                    <el-checkbox-group v-model="rulePayDialog.paymethod">
                        <el-checkbox v-for="(v,k) in cfg.payKindMap" :label="k" :key="k">{{v}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :title="couponDialog.title" :visible.sync="couponDialog.show" width='80%'>
            <div class="payinfo_box">
                <el-table :data="couponData" border style="width: 100%" v-loading="couponShade">
                    <el-table-column label="#" prop='id' width='60' type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部">
                                    <span>{{ props.row.area_name+"/"+props.row.dept_name }}</span>
                                </el-form-item>
                                <el-form-item label="已用/总数">
                                    <span>{{ props.row.used_num + "/" + props.row.groupNum }}</span>
                                </el-form-item>
                                <el-form-item label="有效期">
                                    <span>{{props.row.start_time + "-" + props.row.end_time }}</span>
                                </el-form-item>
                                <el-form-item label="创建方式">
                                    <span>{{ props.row.create_type }}</span>
                                </el-form-item>
                                <el-form-item label="编码">
                                    <span>{{ props.row.cnum }}</span>
                                </el-form-item>
                                <el-form-item label="进场时间">
                                    <span>{{ props.row.arrival_time }}</span>
                                </el-form-item>
                                <el-form-item label="出场时间">
                                    <span>{{ props.row.departure_time }}</span>
                                </el-form-item>
                                <el-form-item label="进场道闸">
                                    <span>{{ props.row.arrival_device_name}}</span>
                                </el-form-item>
                                <el-form-item label="出场道闸">
                                    <span>{{ props.row.departure_device_name}}</span>
                                </el-form-item>
                                <el-form-item label="领取方式">
                                    <span>{{ props.row.recevie_type}}</span>
                                </el-form-item>
                                <el-form-item label="应收金额">
                                    <span>{{ props.row.temp}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="批次" prop='batch' min-width='50'></el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='150'></el-table-column>
                    <el-table-column label="车场" prop='station_name' min-width='100'></el-table-column>
                    <el-table-column label="名称" prop='type_name' min-width='130'></el-table-column>
                    <el-table-column label="优惠券面额" prop='denomination' min-width='90'></el-table-column>
                    <el-table-column label="购买金额" prop='buy_amount' min-width='80'></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='80'></el-table-column>
                    <el-table-column label="领取时间" prop='assign_time' min-width='180'></el-table-column>
                    <el-table-column label="使用时间" prop='use_time' min-width='180'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='80'></el-table-column>
                </el-table>
            </div>
        </el-dialog>
        <el-dialog :title="seatDialog.title" :visible.sync="seatDialog.show" width="30%">
            <div class="tc">{{seatDialog.content}}</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="seatDialog.show = false">取 消</el-button>
                <el-button type="primary" @click="goBindSeat">绑定坐席号</el-button>
              </span>
        </el-dialog>
    </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        //月卡 和 月卡过期不显示缴费信息
        //其它 都显示 
        let cfg = {
            source:utils.config.payMethod,
            type:{'MONTH':"月卡",'TEMP':"临停",'BOOKING':"车位锁预约",'NOFEEL':"无感支付"},
            send:{'MONTH':"下发",'TEMP':"开闸",'BOOKING':"下发",'NOFEEL':"开闸",'Y':"成功",'N':"失败"},
            invoice:{'1':'开票中','2':'成功','3':'失败','4':'已红冲','5':'待签章','N':'未开票'},
            payKindMap: { 'APP': '线上缴费', 'iPos': 'iPos', 'manual': '现金', 'TCB': '停车宝', 'CWB': '车位宝', 'EFT': 'E费通' },
            ruleKind:{'Y':"年卡",'M':"月卡",'D':"日卡",'S':"季卡",'T':"次卡"},
            feetype:{'property':"物业费",'bankdeduct':"银行代扣"},
            url: {
                parkedwhere: '/car/parkedwhere?car_id=', //plate= ''; car_id= '';均可
                lists: '/contract/lists',
                inlists: '/inout/inlists?page=1&pagesize=1&car_id=',
                noplateinlist: '/carport/unlicenseLists?page=1&pagesize=20',
                outlists: '/inout/inlists?page=1&pagesize=1&car_id=',
                openDevice: '/custom/open', //
                stationLimit: '/station/show?station_id=', //停车场缴费限制查看 get  station_id
                ruleLimit: '/rule/show?rule_id=', //月卡缴费规则查看 get  rule_id
                history: '/inout/outHistory?car_id=',
                paymentHistory: '/order/payment?sort_type=3', //order/payment?page=1&pagesize=20&car_id=68194&sort_type=3&begintime=2018-12-10%2000:00:00&endtime=2019-04-08%2014:47:18

                getMoney: '/temp/money', //计算优惠 plate   station_id
                getTempmoney: '/temp/tempMoney', //计算临停计费 car_id   station_id
                devicelists: '/device/lists?page=1&pagesize=200&type=1&station_id=',
                insideCar: '/custom/insidePlate', //在场内车牌post 
                noplatecost: '/unlicense/cost', //无牌车计费
                applylist: '/examine/applylists?page=1&pagesize=20&state=0&type=mon&car_id=',
                couponlist: '/coupon/lists?page=1&pagesize=20&departure=', //出场ID 从出场纪录中查询 
                getSeat: '/custom/lists',
                wsuri: 'wss://smart.eptingche.cn/'
            },
            month: { Y: '月卡', N: '临停', U: '未知' },
            expiredStatus: { Y: '过期', N: '未过期' },
            ispayStatus: { Y: '已支付', N: '未支付' },
            isInOutStatus: { Y: '场内', N: '离场' },
            reason: {
                'month': '有效月卡',
                'overdue': '月卡过期',
                'position_occup': '月卡共享车位被占',
                'temp': '普通临停',
                'recover': '无进场信息',
                'noplate': '无牌车' //这种情况要开闸就发  specail_car
            },
            status: { "apply": "apply", "created": "已创建", "working": "使用中", "locked": "已禁用", "delayed": "delayed", "canceled": "已取消", 'deleted': '已删除' },
            devicefaults: { "apply": "识别仪故障", "created": "补光灯", "working": "主控板损坏", "locked": "弹簧" }, //设备故障
            deviceothers: { "apply": "艾科平台经常性502", "created": "一位多车异常，都在有效期内，但有一台车进出却一直显示临停" }, //
        };
        return {
            cfg,
            hasPlate: false,
            applyShade: false,
            couponShade: false,
            plateslist: false,
            stationslist: false,
            searchLoading: false,
            noplate_cost: false,
            recordPagination : { page: 1, pagesize: 20, total: 0, showTotal: true },
            excepteForm: { type: [], others: [] },
            commonDialog: { title: '提示', show: false, content: '' },
            seatDialog: { title: '提示', show: false, content: '' },
            stationPayDialog: { title: '停车场缴费限制', show: false, pay_channel: [], payWay1: [], payWay2: [], payWay3: [], payWay4: [] },
            rulePayDialog: { title: '月卡规则限制', show: false, paymethod: [] },
            couponDialog: { title: '优惠券详情', show: false },
            customer: { phone: '',cno:''}, //临停 无牌车
            carData: { car_id: '', plate: '', plates: [], rule: '', time_begin: '', time_end: '', rule_name: '', rule_N1: '', station: '', station_name: '__', arrival: '', isMonth: '', epiredTime: '', share_carids: '', share_plates: '', space: '', instation_plates: '', reason: '', device_id: '' }, //车辆信息
            tableData: [],
            applyData: [],
            couponData: [],
            payInfo: { arrive: '__', parktime: '__', status: 'N', total: '__', free: '__', money: '__', tnum: '' }, //缴费信息
            shade: false,
            showdiff: true,
            recordShade: false,
            recordData: [],
            search: { car_id: '', phone: '', station: '', device: '' },
            plates: [],
            stations: [],
            devices: [],
            remoteInfo: { title: '', cmd: '', show: false, info: {} },
            localData: { show: false, title: '', shadeLoc: false, dataET: [], dataLoc: [] },
            currentCar: '', //{station:'',car:'',rule:''}
            images: { show: false, lists: [] },
            user: {},
            result_inhistory: {},
            applyPopwin: { title: '订单详情', show: false },
            concatAllFlag: false,
            seat: '',
            websock: null,
            heartTime: null,
            timeout: 30000, // websocket心跳
            contractShade:false,
            contractData:[],
        }
    },
    watch: {
        // 'search.station': function() {
        //     this.getDeviceData();
        // },
        // 'carData.station': function() {
        //     this.getDeviceData();
        // }
    },
    mounted() {
        
        let store = this.$store.state.global.login.data;
        this.user = { user_id: store.user_id, global_oa: store.user_name, global_name: store.user_realname };
        this.initWebSocket()
        this.getSeatId()
        //this.getData();
        // this.init();
        const params = this.$route.params;
        if (JSON.stringify(params) != '{}') { 
            this.setRobotData(params) //坐席号匹配了再设置页面信息
            this.init();
        }
    },
    methods: {
        initWebSocket() { //初始化websocket
            if ('WebSocket' in window) {
                const wsuri = this.cfg.url.wsuri;
                this.websock = new WebSocket(wsuri); //这里面的this都指向vue
                this.websock.onopen = this.websocketopen;
                this.websock.onmessage = this.websocketonmessage;
                this.websock.onclose = this.websocketclose;
                this.websock.onerror = this.websocketerror;
            } else {
                console.log('do not support websocket')
            }
        },
        websocketonmessage(e) { //数据接收
            this.heartCheck();
            if (e.data === 'connected' || e.data === 'ting') { console.log('connected or ting');} else {
                let data = JSON.parse(e.data);
                console.log(data)
                this.getSeatId().then(() => {
                    if (Number(data.cno) === Number(this.seat)) {
                        if (data.type === 'usual') { //日常管控
                            this.setRobotData(data)
                            this.init();
                        } else { //data.type==='robot' 
                            this.$router.push({ path: '/cService/server', name: '新版智能客服', params: data })
                        }
                    }
                });
            }
        },
        heartCheck() {
            var vm = this;
            vm.heartTime = setTimeout(function() {
                if(vm.websock && vm.websock.readyState == 1 ){
                    vm.websock.send("ting");
                }
            }, vm.timeout)
        },
        websocketopen() {console.log("WebSocket连接成功")},
        websocketclose() {
            console.log("WebSocket关闭");
            clearTimeout(this.heartTime)
            this.initWebSocket()
        },
        websocketerror() {console.log("WebSocket连接失败");},
        closewebsocket() {this.websock && this.websock.close();},
        setRobotData(data) {
            let vm = this;
            vm.customer.phone = data.customerNumber;
            vm.customer.cno = data.cno //ws推过来的坐席号
            console.log(vm.customer)
        },
        init() {
            //根据来电确定是客服来电还是机器人来电 如果是机器人就跳转到智能客服
            if (this.customer.phone) {
                this.search.phone = this.customer.phone;
            }
            //接入电话时，如果有手机号，先把号码填到搜索框，再手动调用getData()
            this.getData();
        },
        goBindSeat() {
            let r = { path: '/cService/index' };
            this.$router.push(r);
        },
        getSeatId() {
            let vm = this;
            let url = `${vm.cfg.url.getSeat}?oa=${vm.user.global_oa}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content.length === 0) {
                            vm.seatDialog = { title: '提示', show: true, content: '您未绑定坐席号！' };
                        } else {
                            vm.seat = res.content.seat || '';
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //判断手动输入 
        isHandleChange() {
            if (this.search.station && this.stationslist) {
                return true;
            }
            if (this.search.car_id && this.plateslist) {
                return true;
            }
        },
        changeSelect(val, type) {
            console.log(val)
            if (type === '1') {
                this.plates = [];
            }
            if (type === '2') {
                this.stations = [];
            }
        },
        changeInput(val) {
            if (val === '1') {
                this.search.station = '';
                this.stationslist = !this.stationslist;
            }
            if (val === '2') {
                this.search.car_id = '';
                this.plateslist = !this.plateslist;
            }
        },
        getData() {
            let vm = this;
            // vm.carData = {}; 是否需要还原数据
            // vm.payInfo =  { arrive: '__', parktime: '__', status: 'N', total: '__', free: '__', money: '__', tnum: '' };
            let url = vm.cfg.url.lists + "?page=1&pagesize=100";
            if(vm.search.phone && !utils.isMobile(vm.search.phone)){
                vm.$message({ showClose:true, message:'手机号格式不正确', type:'error' }); return;
            }
            let { station: station_id, ...others } = vm.search;
            let querystr = utils.setQueryString({ station_id, ...others });
            url += querystr ? '&' + querystr : '';
            if (vm.search.car_id) { //手动输入车牌
                vm.carData.car_id = vm.search.car_id;
                vm.getRecoder(); //半年缴费纪录 月卡临停都要查
                vm.handlerInputPlate()
                // vm.getInhistory(); //根据车牌查找进场纪录   查询最后一次进场时间
            }
            console.log(url)
            vm.searchLoading = true;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0 && res.content.lists) {
                    //如果res.content:''  res.code ==0 todo
                    // if (false) { //test 模拟临停
                    let lists = res.content.lists;
                    if (!vm.concatAllFlag) { //第一次合并车场和车牌列表，其它时间不合并，除非重置
                        vm.setCarDataVal(lists);
                        vm.concatAllFlag = !vm.concatAllFlag
                        console.log('concatAllFlag')
                    }
                    let { plates, rule_name, station_name, rule_status, time_begin, time_end, status, station, rule } = lists[0];
                    vm.carData = { rule_name, station_name, rule_status, time_begin, time_end, status, station, rule };
                    console.log(vm.carData)
                    vm.carData.car_id = plates[0].car_id;
                    vm.carData.plate = plates[0].plate;
                    vm.getDeviceData();
                    //默认第一条纪录的车牌
                    //不管有没有search 只要有搜索结果 carData的值都在结果中取出来
                    vm.carData.isMonth = 'Y';
                    vm.carData.reason = 'month';
                    vm.isMonthExpired(); //判断是否过期 
                    vm.getRecoder(); //半年缴费纪录 月卡临停都要查
                    vm.getInhistory().then((res) => {
                        vm.carData.lastest = vm.result_inhistory.creationtime;
                    }); //根据车牌查找进场纪录   查询最后一次进场时间
                } else {
                    vm.carData.isMonth = 'N';
                    vm.carData.reason = 'temp';
                    if (!vm.carData.car_id && vm.search.phone) {
                        vm.getNoplateInlist(); //查不到月卡,有临停和无牌车两种情况
                    }
                }
                vm.searchLoading = false;
            })
        },
        getNoplateInlist() {
            let vm = this;
            let url = `${vm.cfg.url.noplateinlist}&mobile=${vm.search.phone}`;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0 && res.content.lists) { //没有lists就不是无牌车
                    vm.carData.reason = 'noplate';
                    vm.carData.plate = '无牌车';
                    //others = {device,device_name,device_out,device_out_name,enter_time,out_time,station,station_name}
                    let { id, area_name, dept_name, client, mobile, status: noplate_status, ...others } = res.content.lists[0];
                    vm.carData = { ...vm.carData, ...others, noplate_status };
                    vm.getDeviceData();
                    vm.noplate_cost = false;
                    vm.getNoplateCost();
                }else{
                    //vm.carData.isMonth = 'N';
                    //vm.carData.reason = 'temp';
                }
            })
        },
        getNoplateCost() {
            //无牌车通过手机号查询纪录
            let vm = this;
            let url = `${vm.cfg.url.noplatecost}?device_id=${vm.carData.device}&mobile=${vm.search.phone}`;
            utils.fetch(url).then((res) => {
                if (typeof(res) != 'undefined') {
                    if (res.code === 0 && res.content) {
                        let { money, begin, end } = res.content.info.result;
                        let { coupon_money, coupon_original } = res.content;
                        let now_time = Date.now();
                        let beginStr = utils.strToDate(begin);
                        let start = new Date(beginStr).getTime();
                        let diff = now_time - start;
                        let parktime = utils.differenceTime(diff, 1);
                        vm.payInfo.parktime = parktime; //停车时长
                        vm.payInfo.arrive = beginStr; //进场时间
                        vm.payInfo.money = coupon_original; //计算总费用
                        vm.payInfo.free = coupon_money; //计算总费用
                        vm.payInfo.total = utils.calc(coupon_original, coupon_money, '-'); //计算优惠后的应付费用
                        vm.payInfo.status = 'N';
                        vm.noplate_cost = true;
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        setCarDataVal(arr) {
            let vm = this;
            if (arr.length === 0) { return };
            let stations = [...arr]; //所有手机号下面的纪录 
            vm.stations = utils.unique(stations, 'station');
            vm.stationslist = false;
            vm.plates = []; //先清空
            arr.map(item => {
                let plates = [...vm.plates, ...item.plates] //拼接所有列表中的plates
                vm.plates = utils.unique(plates, 'car_id') //去重
            })
            vm.plateslist = false;
        },
        //计费优惠优惠
        getMoney() {
            let vm = this;
            if (!vm.carData.plate || !vm.carData.station) {
                vm.$message({ showClose: true, message: '没有车牌或者车场信息', type: 'error' });
                return;
            }
            let url = `${vm.cfg.url.getMoney}?plate=${vm.carData.plate}&station_id=${vm.carData.station}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        let { money, cover, coupon, attach } = res.content;
                        vm.payInfo.free = Number(money) //优惠金额
                        vm.payInfo.cover = cover
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //查询缴费信息
        getTempmoney() {
            console.log('getTempmoney')
            //判断是否已经缴费
            let vm = this;
            let url = `${vm.cfg.url.getTempmoney}?car_id=${vm.carData.car_id}&station_id=${vm.carData.station}`;
            utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        let { money, begin, end } = res.content.info.result;
                        let now_time = Date.now();
                        let beginStr = utils.strToDate(begin);
                        //计算出场时间 方便查询近一个小时内的订单
                        let endStr = utils.strToDate(end);
                        let newEnd = new Date(endStr).getTime() + 60 * 60 * 1000;
                        let endtime = utils.timeParse(newEnd, '-', true);
                        vm.payInfo.end = endtime; //加了一个小时的离场时间为了查询订单

                        let start = new Date(beginStr).getTime();
                        let diff = now_time - start;
                        let parktime = utils.differenceTime(diff, 1);
                        vm.payInfo.parktime = parktime; //停车时长
                        vm.payInfo.arrive = beginStr; //进场时间
                        vm.payInfo.money = money; //计算总费用
                        vm.payInfo.status = 'N';
                        if (money > 0) {
                            let accdel = utils.calc(money, vm.payInfo.free, '-')
                            if (vm.payInfo.cover) {
                                vm.payInfo.total = vm.payInfo.free; //优惠金额
                                vm.payInfo.free = accdel
                            } else {
                                vm.payInfo.total = accdel; //计算优惠后的应付费用
                            }
                        } else { //money === 0
                            //没产生费用  或者 已经缴费了 
                            // vm.getTnumByOrder();
                            vm.payInfo.status = 'Y';
                            vm.payInfo.total = 0;
                            vm.payInfo.free = 0;
                            vm.payInfo.money = 0;
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //只查询订单信息
        getTnumByOrder() {
            let vm = this;
            let url = `${vm.cfg.url.orderlists}${vm.carData.car_id}&begintime=${vm.payInfo.arrive}&endtime=${vm.payInfo.end}`;
            utils.fetch(url).then(function(res) {
                if (res.code == 0 && res.content && res.content.lists) {
                    let content = res.content.lists[0] || [];
                    vm.orderData = [{ ...content }] //储存订单信息 查看时直接显示
                    vm.payInfo.status = 'Y'; //请求返回后，再显示订单及按钮
                    vm.payInfo.tnum = content.tnum;
                } else {
                    vm.$message({ showClose: true, message: '出场未产生费用', type: 'error' })
                }
            });
        },

        btnSearch() {
            //手机号搜索的记录可能多条，但车牌只有一条记录
            this.getData()
        },
        btnUndo() {
            this.search = { car_id: '', phone: '', station: '' };
            this.clearAll();
            this.clearStationsPlates();
            this.concatAllFlag = false;
        },
        clearAll() {
            this.carData = { phone: '', plates: '', car_id: '', plate: '', rule: '', rule_name: '', rule_N1: '', station: '', station_name: '', location: '', time_begin: '', time_end: '' };
            this.payInfo = { arrive: '__', parktime: '__', status: 'N', total: '__', free: '__', money: '__', tnum: ''};
            this.images = { show: false, lists: [] };
            this.recordData = [];
            this.tableData = [];
            this.devices = [];
        },
        clearStationsPlates() {
            this.plates = [];
            this.stations = [];
        },

        //人工输入车牌+车场去计算费用
        handlerInputPlate() {
            let vm = this;
            //有了车牌去查进场纪录 得到车场 再计费 todo
            vm.getInhistory().then(() => {
                vm.carData.station = vm.result_inhistory.station;
                vm.carData.station_name = vm.result_inhistory.station_name;
                vm.getDeviceData();
                vm.carData.plate = vm.result_inhistory.plate;
                vm.getcalMoney();
            });
        },
        //计算临停费用
        getcalMoney() {
            this.getMoney().then(() => {
                this.getTempmoney();
            })
        },
        getDeviceData() {
            let vm = this;
            let url = `${vm.cfg.url.devicelists}${vm.search.station||vm.carData.station}`
            vm.devices = [];
            utils.fetch(url).then((res) => {
                vm.devices = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
            });
        },
        getCouponList() {
            let vm = this;
            let url = `${vm.cfg.url.couponlist}${vm.carData.departure}`;
            vm.couponShade = true;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    vm.couponData = res.content.lists || [];
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                };
                vm.couponShade = false;
            })
        },
        getApplyList() {
            let vm = this;
            let url = `${vm.cfg.url.applylist}${vm.carData.car_id}`;
            if (vm.search.station) {
                url += `&station_id=${vm.search.station}`;
            }
            vm.applyShade = true;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    vm.applyData = res.content.lists || [];
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                };
                vm.applyShade = false;
            })
        },
        getRecoder() {
            let vm = this;
            console.log('getRecoder');
            let now = new Date().getTime();
            let endtime = utils.timeParse(now);
            let begintime = utils.getHalfYear();
            let pobj = vm.recordPagination;
            let url = `${vm.cfg.url.paymentHistory}&car_id=${vm.carData.car_id}&page=${pobj.page}&pagesize=${pobj.pagesize}&begintime=${begintime}&endtime=${endtime} `;
            vm.recordShade = true;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    vm.recordData = res.content.lists||[];
                    vm.recordPagination.total =  res.content.total ||  0;
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                };
                vm.recordShade = false;
            })
        },
        getContractRecoder() {
            let vm = this;
            let url = `${vm.cfg.url.lists}&page=1&pagesize=100&car_id=${vm.carData.car_id}`;
            vm.contractShade = true;
            utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    vm.contractData = res.content.lists
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                };
                vm.contractShade = false;
            })
        },
        //计算月卡是否过期
        isMonthExpired() {
            let vm = this;
            var end = new Date(vm.carData.time_end);
            var now = new Date();
            let epired = !!(end.getTime() < now.getTime())
            vm.carData.is_expired = epired ? 'Y' : 'N';
            if (vm.carData.is_expired === 'Y') {
                vm.carData.reason = 'overdue'
            }
        },
        getOuthistory() {
            let vm = this;
            let url = `${vm.cfg.url.outlists}${vm.carData.car_id}`;
            return utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    let result = res.content[0];
                    vm.carData.departure = result.id;
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' })
                }
            })
        },
        getInhistory() {
            let vm = this;
            let url = `${vm.cfg.url.inlists}${vm.carData.car_id}`;
            return utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    let result = res.content[0];
                    vm.result_inhistory = result;
                    //vm.carData.lastest = result.creationtime; //最后一次进场时间
                    // vm.carData.station = result.station; //车场
                    // vm.carData.station_name = result.station_name; //车场
                    // vm.carData.plate = result.plate;
                } else {
                    vm.$message({ showClose: true, message: '查询最后一次进场时间失败', type: 'error' })
                }
            })
        },
        /**
         * [getPerOutData 根据车场得到预出场信息；车场可以根据parkedwhere得到也可以根据用户手动输入得到]
         * @return {[type]} [description]
         */
        getPerOutData: function() {
            var vm = this;
            var url = '/inout/appearanceList?page=1&pagesize=1000';
            if (vm.search.station) url += "&station_id=" + vm.search.station;
            //if(vm.search.car) url += "&plate="+vm.search.car; todo?
            vm.shade = true;
            utils.fetch(url).then((json) => {
                if (json && json.code == 0) {
                    vm.tableData = json.content.lists;
                    vm.shade = false;
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
            });
        },
        getPayChannel() {
            let vm = this;
            let url = "/station/payChannelLists";
            return utils.fetch(url).then(function(res) {
                if (res && res.code == 0) {
                    let channel =
                        typeof res != "undefined" && res.code == 0 ? res.content : [];
                    vm.stationPayDialog.payWay1 = channel.filter(item => {
                        return item.channel === '彩支付';
                    })
                    vm.stationPayDialog.payWay2 = channel.filter(item => {
                        return item.channel === 'ipos';
                    })
                    vm.stationPayDialog.payWay3 = channel.filter(item => {
                        return item.channel === 'EP微信';
                    })
                    vm.stationPayDialog.payWay4 = channel.filter(item => {
                        return item.channel === 'EP支付宝';
                    })
                    console.log(vm.stationPayDialog)
                }
            });
        },
        showPayLimit(id) {
            let vm = this;
            if (id === "1") { //停车场缴费限制
                vm.stationPayDialog.show = true;
                let url = `${vm.cfg.url.stationLimit}${vm.carData.station}`
                vm.getPayChannel().then(() => {
                    utils.fetch(url).then((res) => {
                        if (res.code === 0 && res.content) {
                            vm.stationPayDialog.pay_channel = res.content.pay_channel;
                        }
                    });
                })
                return;
            }
            if (id === "2") { //月卡规则限制
                vm.rulePayDialog.show = true;
                let url = `${vm.cfg.url.ruleLimit}${vm.carData.rule}`
                utils.fetch(url).then((res) => {
                    if (res && res.code == 0) {
                        if (res.code === 0 && res.content) {
                            vm.rulePayDialog.paymethod = res.content.paymethod;
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                });
                return;
            }
            if (id === "3") { //月卡缴费限制
                let visiable = vm.carData.visiable;
                let str = visiable === 'Y' ? '允许线上缴费' : '不允许线上缴费';
                vm.commonDialog.show = true;
                vm.commonDialog.title = '月卡缴费限制';
                vm.commonDialog.content = str;
                return;
            }
        },
        imgshow: function() {
            var vm = this;
            let inlistUrl = '/inout/inlists?page=1&pagesize=20&car_id=' + vm.carData.car_id;
            utils.fetch(inlistUrl).then(res => {
                if (res.content && Array.isArray(res.content) && res.content.length > 0) {
                    return res.content[0]
                } else {
                    vm.$message({ showClose: true, message: '没有查到当前车牌进场纪录', type: 'error' });
                    return false
                }
            }).then(row => {
                if (row) {
                    vm.images = { show: true, lists: [] };
                    utils.fetch('/inout/images?type=in&station_id=' + row.station + '&id=' + row.id + '&date=' + row.time_recv.substr(0, 7)).then(function(json) {
                        if(typeof(json) != 'undefined'){
                            if (json.code == 0 && json.content.length > 0) {
                                vm.images.lists = json.content
                            } else {
                                vm.images.show = false;
                                vm.$message({ showClose: true, message: json.message, type: 'error' });
                            }
                        }
                    });
                }
            })
        },
        //查看优惠券详情
        couponshow() {
            let vm = this;
            vm.couponDialog.show = true;
            vm.getOuthistory().then(() => {
                vm.getCouponList();
            })
        },
        //查看订单详情
        showApplyDetail() {
            this.applyPopwin.show = true;
            this.getApplyList();
        },
        goApplyList() {
            let params = {car_id: this.carData.car_id };
            let r = { path: '/examine/apply_lists', name: '月卡申请', params };
            this.$router.push(r);
        },
        goPaymentList() {
            let params = { car_id: this.carData.car_id };
            let r = {name:'交易订单',path:'/order/payment',params};
            this.$router.push(r);
        },
        //开闸操作
        openDevice(type) {
            let vm = this;
            if (!vm.carData.device_id) {
                vm.$message({ showClose: true, message: '请选择一个道闸', type: 'error' });
                return;
            }
            let reason =  vm.carData.reason;
            if(reason === "noplate"){
                reason = 'specail_car'
            } 
            let data = {
                device_id: vm.carData.device_id,
                station_id: vm.carData.station,
                seat: vm.seat,
                reason,
                source: 'custom',
                plate: vm.carData.plate, //选 无牌车就没有
                // client_id: vm.user.user_id, //选
                // mobile: vm.tempSheet.mobile, //选
                // image: [], //选  异常开闸的时候 必须要有一个图片
            };
            console.log(data);
            if(reason==='temp'){
                data.mobile = vm.customer.phone || vm.search.phone
            }
            //出场  异常开闸 还要传图片
            let url = `${vm.cfg.url.openDevice}`;
            utils.fetch(url, { method: 'POST', body: data }).then((res) => {
                if (typeof(res) != 'undefined') {
                    if (res.code === 0) {
                        vm.commonDialog = { title: '提示', show: true, content: '开闸成功' }; // todo 是否需要一个弹窗
                        // vm.$message({ showClose: true, message: '开闸成功', type: 'success' })
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }

                }
            })
        },
        imgClose() {
            this.images = { show: false, lists: [] };
        },
        //关单操作
        closeSheet() {
            this.clearAll();
        },
        statusFmt:function(cellValue,time_end){
            if(cellValue == 'canceled'){
                return '<span style="color:red;font-style:italic">已取消</span>';
            }else if(cellValue == 'created'){
                return "已创建";
            }else if(cellValue == 'locked'){
                return '<span style="color:grey;font-style:italic">已禁用</span>';
            }else if(cellValue == 'working'){
                return "使用中";
            }else{
                return cellValue;
            }
        },
        statusFmt_timeend(time){
            var end = new Date(time);
            var now = new Date();
            if( end.getTime() < now.getTime() ){
                return '<span class="red">'+time+'</span>';
            }else{
                return '<span>'+time+'</span>'
            }
        },
        platesfmtrow:function(row,column){
            var d = row.plates.map(function(k){
                return k.plate;
            });
            return d.join(",");
        },
        setRecordPageData: function(pageObj) {
            this.recordPagination = pageObj;
            this.getRecoder();
        },
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            //vm.getRecoder()
            // vm.getContractRecoder()
            // vm.getApplyList()
        });
    }, 
    beforeDestroy () {
        
    },
    activated(){
        console.log('control');
        //console.log(this.websock)
        if(this.websock && this.websock.readyState === 3 ){
            this.initWebSocket()
        }
        const params = this.$route.params;
        if (JSON.stringify(params) != '{}') { 
            this.setRobotData(params) //坐席号匹配了再设置页面信息
            this.init();
        }
    },
    deactivated(){
        this.closewebsocket()
        console.log('deactivated')
    }
}
</script>
<!-- <style scoped>
.pay-way .el-checkbox__inner {
    background-color: #3b5d90!important; 
    border-color: #2959ca!important;
}
</style> -->