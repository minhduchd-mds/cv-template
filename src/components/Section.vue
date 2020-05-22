<template>
    <section id="page-home">
        <v-container fluid>
            <v-row
                    :align="alignment"
                   :justify="justify"
            >
                <v-col cols="12" sm="12" md="6" lg="6" xl="6"  class="border-bg-left">
                    <div  class="profile pt-5 pb-5 animated fadeInLeft delay-1s active">
                        <div class="profile-content mt-5">
                            <img src="../assets/images/IMG_3038.jpg" class="img-fluid shadow" alt="">
                            <ul class="profile-p">
                                <li><i class="fa fa-user"></i><span>Đỗ Minh Đức</span></li>
                                <li><i class="fa fa-birthday-cake"></i><span>09/10/1995</span></li>
                                <li><i class="fa fa-address-book"></i><span>Bắc từ liêm , Hà Nội</span></li>
                                <li><a href="tel:0345780397"><i class="fa fa-phone"></i><span>0345780397</span></a></li>
                                <li><i class="fa fa-language"></i><span>VN,English</span></li>
                                <li><i class="fa fa-mail-forward"></i><span>dominhduchd10@gmail.com</span></li>
                            </ul>
                            <div class="social-network mt-5">
                                <a href="#" class="fa fa-facebook"></a>
                                <a href="https://github.com/minhduchd-mds" class="fa fa-github"></a>
                                <a href="#" class="fa fa-google"></a>
                                <a href="#" class="fa fa-linkedin"></a>
                                <a   download href="../../public/Do-Minh-Duc.pdf" class="fa fa-file-pdf-o"></a>
                            </div>
                        </div>

                        <a class="carousel-control-prev-1 btn" href="javascript:void(0);">
                            <span class="prev" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                    </div>
                    <div id="card-left-1"  class="card p-5 animated fadeInRight">
                        <div class="card">
                            <div class="card-body">
                                <div class="text">
                                    <h3 class="">Học vấn</h3>
                                    <p>Viện đào tạo lập trình viên quốc tế FPT APPTECH</p>
                                    <p>Chuyên ngành: Lập trình viên</p>
                                </div>

                                <div class="text">
                                    <h3 class="">Chứng chỉ</h3>

                                    <p>Lập trình viên quốc tế FPT APPTECH</p>

                                </div>
                                <div class="text">
                                    <h3 class="">Giải thưởng</h3>

                                    <p>Giải khuyến khích Hackthon FPT </p>
                                </div>
                                <div class="text">
                                    <h3 class="">Sở thích</h3>
                                    <p>Game, Phim, Nhạc , Design web.</p>
                                </div>
                                <div class="text-p">
                                    <h3 class="">Các kĩ năng mềm</h3>
                                    <ul>
                                        <li>
                                            - Làm việc theo nhóm .
                                        </li>
                                        <li>
                                            - Giao tiếp tốt.
                                        </li>
                                        <li>
                                            - Tinh thần học hỏi cao.
                                        </li>
                                        <li>
                                            - Github, GitLap.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <a class="carousel-control-prev-2 btn" href="javascript:void(0);">
                            <span class="prev" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                    </div>
                    <div id="card-left-2"  class="card p-5 animated fadeInRight">
                        <div class="card">
                            <div class="card-body">
                                <div class="project-sm1">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">08/2017</span>
                                                -
                                            <span class="experience-end">09/2017</span>
                                        </span>
                                    </div>
                                    <h4>Project FPT ApTech ( 2017)</h4>
                                    <ul>
                                        <li>- Thiết kế trang web giới thiệu về FPT AppTech.</li>
                                    </ul>
                                </div>

                                <div class="project-sm2">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">06/2018</span>
                                                -
                                            <span class="experience-end">10/2018</span>
                                        </span>
                                    </div>
                                    <h4>Project IOT <span>(Bionic - Hackthon FPT 2018)</span></h4>
                                    <ul>
                                        <li>
                                            - Bionic là hệ thống trồng cây ,nuôi cá thông minh điều khiển qua
                                            app di động .
                                        </li>
                                        <li>
                                            - Thiết kế giao diện điều khiển hệ thống chiếu sáng , bơm nước ,
                                            dinh dưỡng , máy bơm , bẳng thông kê nhiệt độ độ ẩm ,PH ...
                                        </li>
                                        <li>
                                            - Thiết kế trang web giới thiệu về hệ thống Bionic.
                                        </li>
                                    </ul>
                                </div>


                                <div class="project-sm3">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">04/2019</span>
                                                -
                                            <span class="experience-end">05/2019</span>
                                        </span>
                                    </div>
                                    <h4>Project Smart Traffic  <span>(Techwiz 2019)</span></h4>
                                    <ul>
                                        <li>
                                            - Smart Traffic là hệ thống giúp người dùng xem được thông tin
                                            tình trạng giao thông ,gửi thông tin lên admin quản lý biết chính xác
                                            gọi sos được dùng trên app di động và quản lý web .
                                        </li>
                                        <li>
                                            - Thiết kế giao diện logo, form , thông báo , sos , home, profile...
                                        </li>
                                        <li>
                                            - Thiết kế trang web trang quản lý admin .
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>


                        <a class="carousel-control-prev-3 btn" href="javascript:void(0);">
                            <span class="prev" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                    </div>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="6" xl="6" class="border-bg-right">
                    <div id="main-right" class="pt-5 pb-5 ml-3 animated fadeInRight delay-1s active">
                        <div class="card">
                            <div class="title-h3">
                                <h3 class="">Mục tiêu</h3>
                            </div>
                            <div class="card-body">
                                <div class="main-description">
                                    <p>
                                        <i class="fa fa-quote-left fa-3x fa-pull-left fa-border" aria-hidden="true"></i>
                                    </p><div id="text-tagert">Tạo ra những sản phẩm chất lượng mang lại giá trị cho khách hàng cũng như sự phát triển của công ty.</div>
                                    <p></p>

                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="title-h3">
                                <h3 class="">Kĩ Năng</h3>
                            </div>
                            <div class="card-body">
                                <div class="skills-text">
                                    <dl class="skills-list">
                                        <dt class="skill-name">HTML</dt>
                                        <dd class="skill-percent skill-percent-html" data-percent="90%"></dd>
                                        <dt class="skill-name">CSS</dt>
                                        <dd class="skill-percent skill-percent-css" data-percent="90%"></dd>
                                        <dt class="skill-name">BOOTSTRAP 4,3</dt>
                                        <dd class="skill-percent skill-percent-bootstrap" data-percent="90%"></dd>
                                        <dt class="skill-name">jQuery</dt>
                                        <dd class="skill-percent skill-percent-jquery" data-percent="80%"></dd>
                                        <dt class="skill-name">SCSS</dt>
                                        <dd class="skill-percent skill-percent-scss" data-percent="50%"></dd>
                                        <dt class="skill-name">Javascript</dt>
                                        <dd class="skill-percent skill-percent-javascript" data-percent="70%"></dd>
                                        <dt class="skill-name">Photoshop</dt>
                                        <dd class="skill-percent skill-percent-photoshop" data-percent="70%"></dd>
                                        <dt class="skill-name">PHP</dt>
                                        <dd class="skill-percent skill-percent-php" data-percent="20%"></dd>
                                        <dt class="skill-name">GIT</dt>
                                        <dd class="skill-percent skill-percent-git" data-percent="80%"></dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <a class="carousel-control-next-1 btn" href="javascript:void(0);" >
                            <span class="next" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                    <div id="card-right-1"  class="card p-5 animated fadeInRight">
                        <div class="card">
                            <div class="title-h3">
                                <h3 class="">Kinh nghiệm khi làm việc</h3>
                                <div class="date-time"></div>
                            </div>
                            <div class="card-body">
                                <div class="project-sm1">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">08/2017</span>
                                                -
                                            <span class="experience-end">09/2017</span>
                                        </span>
                                    </div>
                                    <h4>Project SEM 1: <span>Trung tâm báo chí</span></h4>
                                    <ul>
                                        <li>-Trung tâm đào tạo báo chí là trang web đăng ký các khoá học ,
                                            theo dõi tin tức , tài liệu báo chí.
                                        </li>
                                        <li>
                                            - Thiết kế giao diện trang web , trình bày các khoá học hướng dẫn
                                            đăng ký, tư vấn.
                                        </li>
                                    </ul>
                                </div>

                                <div class="project-sm2">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">10/2018</span>
                                                -
                                            <span class="experience-end">12/2018</span>
                                        </span>
                                    </div>
                                    <h4>Project SEM 2: <span>GrabFood</span></h4>
                                    <ul>
                                        <li>
                                            - GrabFood là trang web giúp người dùng đặt đồ ăn qua mạng ,
                                            theo dõi được đường đi trên bản đồ .
                                        </li>
                                        <li>
                                            - Thiết kế giao diện web ,tìm kiếm ,chi tiết đồ ăn , đặt đồ ăn , giao
                                            hàng , thanh toán ...
                                        </li>
                                    </ul>
                                </div>


                                <div class="project-sm3">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">01/2018</span>
                                                -
                                            <span class="experience-end">02/2019</span>
                                        </span>
                                    </div>
                                    <h4>Project SEM 3: <span>Matrimony love</span></h4>
                                    <ul>
                                        <li>
                                            - Matrimony love là nơi bạn có thể tìm thấy tình yêu đích thực và
                                            kết bạn so sánh tìm ra điểm chung phù hợp với mình kết đôi , kết
                                            hôn ,chat trang web hẹn hò online .
                                        </li>
                                        <li>
                                            - Thiết kế giao diện web , người dùng , tìm kiếm , thanh toán , quản
                                            lý chat.
                                        </li>
                                    </ul>
                                </div>
                                <div class="project-sm4">
                                    <hr>
                                    <div class="experience-time">
                                        <span class="time-background">
                                            <span class="experience-start">04/2019</span>
                                                -
                                            <span class="experience-end">Hiện Tại </span>
                                        </span>
                                    </div>
                                    <h4>Project SEM 4:<span>Smart Home</span></h4>
                                    <ul>
                                        <li>
                                            - Smart Home là hệ điều khiển các thiết bị trong nhà bằng giọng nói   thông qua app di động .
                                        </li>
                                        <li>
                                            - Thiết kế giao diện item , logo, icon , home...
                                        </li>
                                        <li>
                                            - Thiết kế giao diện web giới thiệu về Smart Home
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <a class="carousel-control-next-2 btn" href="javascript:void(0);" >
                            <span class="next" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                    <div id="card-right-2" class="card p-5 animated fadeInRight">

                        <div class="card">
                            <div class="card-body">
                                <div class="title-h3">
                                    <h3 class="">Link demo webiste</h3>
                                </div>
                                <div class="link-a">
                                    <a href="https://leading-japanese.firebaseapp.com/#home" target="_blank">Học tiếng nhật</a>
                                    <a href="https://homehottel.web.app/" target="_blank">Giới thiệu nhà ở </a>
                                    <a href="https://homehottel.web.app/login.html" target="_blank">Login  Giới thiệu nhà </a>
                                    <a href="https://vietbac-design.firebaseapp.com/" target="_blank">Trang web cty việt bắc than</a>
                                    <a href="https://valentine-s-day-82824.web.app/" target="_blank">Shop Quà tặng</a>
                                    <a href="https://minhduchd-mds.github.io/Chat/" target="_blank">Hẹn hò mọi lúc mọi nơi</a>
                                    <a href="https://minhduchd-mds.github.io/fdsfsdf/" target="_blank">Web page aptech</a>
                                    <a href="https://minhduchd-mds.github.io/trungtamdaotaobaochi/" target="_blank">Giới thiệu trung tâm đào tạo báo trí</a>
                                    <h5>Link demo từ lâu</h5>
                                    <a href="https://minhduchd-mds.github.io/templeateroom/" target="_blank">Nghe nhạc đỡ buồn</a>
                                </div>
                                <div class="title-h3">
                                    <h3 class="">Design app</h3>
                                </div>
                                <div class="view-zeplin">
                                    <a href="https://scene.zeplin.io/project/5e2422e0ca1d5d59142cf191" target="_blank">Pgae car</a>
                                    <iframe height="300" width="100%"  src="https://scene.zeplin.io/project/5e2422e0ca1d5d59142cf191"></iframe>
                                </div>
                            </div>
                        </div>

                        <a class="carousel-control-next-3 btn" href="javascript:void(0);" >
                            <span class="next" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>

                </v-col>
            </v-row>
        </v-container>
    </section>

</template>

<script>
	export default {
		name: "Section",
		data () {
			return {
				alignmentsAvailable: [
					'start',
					'center',
					'end',
					'baseline',
					'stretch',
				],
				alignment: 'center',
				dense: false,
				justifyAvailable: [
					'start',
					'center',
					'end',
					'space-around',
					'space-between',
				],
				justify: 'center',
			}

		},
	}
</script>
