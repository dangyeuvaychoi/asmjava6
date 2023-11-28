myapp.controller("ctrlcartDetail", function($scope, $http,$window) {
	// Khởi tạo các biến dữ liệu
	$scope.detail = []; // Danh sách chi tiết sản phẩm trong giỏ hàng
	$scope.items = []; // Danh sách sản phẩm
	$scope.itemcart = {}; // Thông tin giỏ hàng
	$scope.price = {}; // Biến giá

	/* Hàm logout để đăng xuất */
	$scope.logout = function() {
		// Hiển thị hộp thoại xác nhận đăng xuất bằng thư viện SweetAlert2
		Swal.fire({
			position: 'top-end',
			title: ' <br>Bạn Muốn Đăng Xuất?<br><br> <a class="btn btn-primary" href="/auth/logoff"> Đăng Xuất</a>',
			showConfirmButton: false,
		})
	}

	/* Hàm viewItems để hiển thị sản phẩm trong giỏ hàng */
	$scope.viewItems = function() {
		var user = $("#usernameCart").text();
		var cartItems = sessionStorage.getItem('cartItems'); // Lấy tên người dùng từ giao diện
		if (user) {
			// Gửi yêu cầu GET để lấy thông tin giỏ hàng của người dùng
			$http.get(`http://localhost:8080/CartItem/cartItems/${user}`).then(resitem => {
				$scope.itemcart = resitem.data; // Lưu thông tin giỏ hàng vào biến $scope.itemcart
				console.log($scope.itemcart);
				$http.get(`http://localhost:8080/CartItem/cartItemDetail/${$scope.itemcart.cartID}`).then(rescartDetail => {
					$scope.detail = rescartDetail.data; // Lưu danh sách chi tiết sản phẩm vào biến $scope.detail

				});
			});

		} else {

			if (cartItems) {
				$scope.detail = JSON.parse(cartItems);
				console.log($scope.detail);
			} else {
				console.log("Không tìm thấy sản phẩm nào trong sessionStorage");
			}

		}

	}
	$scope.viewItems();
	/* Hàm delete để xóa một sản phẩm trong giỏ hàng */
	$scope.delete = function(cartDetailID) {
		var user = $("#usernameCart").text();
		console.log(user);
		if (user) {
			var url = `http://localhost:8080/CartItem/cartItemDetail/${cartDetailID}`;
			$http.delete(url).then(resp => {
				var index = $scope.detail.findIndex(item => item.cartDetailID == cartDetailID);
				$scope.detail.splice(index, 1);

			}).catch(error => {
				console.error('Error:', error); // Log the error to the console
			});
		} else {
			var index = $scope.detail.findIndex(item => item.cartDetailID == cartDetailID);
			if (index !== -1) {
				var product = $scope.detail.splice(index, 1)[0]; // Lấy sản phẩm đã xóa
				var cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
				console.log(user);
				// Tìm index của sản phẩm trong mảng cartItems
				var cartIndex = cartItems.findIndex(item => item.cartDetailID == cartDetailID);
				if (cartIndex !== -1) {
					cartItems.splice(cartIndex, 1); // Xóa sản phẩm khỏi mảng cartItems
				}

				// Lưu mảng cartItems trở lại vào sessionStorage
				sessionStorage.setItem('cartItems', JSON.stringify(cartItems));

				$scope.viewItems.views();
			}


		}
	}
	
	$scope.clear = function() {
		sessionStorage.clear();
		Toast.fire({
			icon: 'success',
			title: 'Đã xóa tất cả sản phẩm',
		})
		 $window.location.reload();		
	}

	$scope.pagecart = {
		page: 0,
		size: 3,
		get items() {
			var start = this.page * this.size;
			return $scope.detail.slice(start, start + this.size);
		},
		get count() {
			return Math.ceil(1.0 * $scope.detail.length / this.size);
		},
		first() {
			this.page = 0;
		},
		prev() {
			this.page--;
			if (this.page < 0) {
				this.last();
			}
		},
		next() {
			this.page++;
			if (this.page >= this.count) {
				this.first();
			}
		},
		last() {
			this.page = this.count - 1;
		}
	}
	// Hàm uploadImages để tải lên ảnh
	$scope.uploadImages = function() {
		const ref = firebase.storage().ref(); // Lấy tham chiếu tới lưu trữ Firebase
		const file = document.querySelector('#photo').files[0]; // Lấy tập tin ảnh từ trường input
		const metadata = {
			contentType: file.type
		};

		const name = file.name; // Lấy tên tập tin
		const uploadIMG = ref.child(name).put(file, metadata); // Tải tập tin lên lưu trữ Firebase với tên tập tin và dữ liệu metadata

		uploadIMG
			.then(snapshot => snapshot.ref.getDownloadURL()) // Lấy đường dẫn URL của tập tin đã tải lên
			.then(url => {
				console.log(url); // Hiển thị URL của ảnh trong console
				// Sử dụng thư viện SweetAlert2 để hiển thị thông báo thành công với ảnh và tiêu đề
				Swal.fire({
					title: 'Upload thành công',
					text: '',
					imageUrl: url, // Đường dẫn ảnh để hiển thị
					imageWidth: 400,
					imageHeight: 400,
					imageAlt: 'Custom image',
				});
			})
			.catch(error => {
				// Nếu có lỗi, hiển thị thông báo lỗi bằng thư viện SweetAlert2
				Swal.fire(
					'Error',
					'Bạn đã gặp lỗi khi upload ảnh :(',
					'error'
				);
			});
	}
	// Hàm dùng để hiển thị thông tin người dùng hiện tại và chỉnh thông tin người dùng
	$scope.edit = function() {
		var user = $("#useredit").text(); // Lấy thông tin người dùng hiện tại
		var url = `http://localhost:8080/restAccount/accountss/${user}`;
		$http.get(url).then(resp => {
			$scope.form = resp.data; // Gán thông tin người dùng cho biến $scope.form để hiển thị và chỉnh sửa
			$scope.names = resp.data.name; // Gán tên người dùng cho biến $scope.names để hiển thị
		}).catch(error => console.log("Error", error));
	}

	// Hàm changepass để đổi mật khẩu
	$scope.changepass = function() {
		var item = angular.copy($scope.form); // Tạo bản sao của thông tin người dùng để chỉnh sửa
		var pass = $("#oldpass").text(); // Lấy mật khẩu cũ từ HTML

		if (angular.equals($scope.change.password, pass) && angular.equals($scope.change.newpassword, $scope.change.confirmpassword) && $scope.change.newpassword.length >= 6) {
			// Kiểm tra mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới, đồng thời kiểm tra độ dài mật khẩu mới
			var url = `http://localhost:8080/restAccount/accounts/${item.email}`;
			item.password = $scope.change.confirmpassword; // Gán mật khẩu mới cho người dùng
			$http.put(url, item).then(resp => {
				Toast.fire({
					icon: 'success',
					title: 'Cập Nhật thành công'
				});
				var index = $scope.items.findIndex(item => item.email == $scope.form.email);
				$scope.items[index] = resp.data; // Cập nhật thông tin người dùng trong danh sách
				$scope.edit(); // Hiển thị thông tin người dùng đã cập nhật
			}).catch(error => {

			});
		} else if (!angular.equals($scope.change.password, pass)) {
			Toast.fire({
				icon: 'error',
				title: 'Bạn nhập mật khẩu cũ không đúng'
			});
		} else if ($scope.change.newpassword.length < 6) {
			Toast.fire({
				icon: 'warning',
				title: 'Hãy chọn mật khẩu có 6 kí tự trở lên!'
			});
		} else {
			Toast.fire({
				icon: 'error',
				title: 'Xác nhận mật khẩu thất bại'
			});
		}
	}
	//  SweetAlert2 là một thư viện JavaScript dùng để thông báo
	const Toast = Swal.mixin({
		toast: true,
		position: 'bottom-start',
		showConfirmButton: false,
		timer: 1500,
		timerProgressBar: true,
		didOpen: (toast) => {
			toast.addEventListener('mouseenter', Swal.stopTimer)
			toast.addEventListener('mouseleave', Swal.resumeTimer)
		}
	})
	//       Hàm imageChangeInfoUser để thay đổi ảnh người dùng
	$scope.imageChangeInfoUser = function(files) {
		var data = new FormData();
		data.append('file', files[0]); // Gắn tập tin ảnh vào dữ liệu FormData
		$http.post(`http://localhost:8080/rest/upload/imageAccount`, data, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined }
		}).then(res => {
			$scope.form.photo = res.data.name; // Gán tên ảnh mới cho thông tin người dùng
		}).catch(error => {
			Swal.fire(
				'Error',
				'Bạn đã gặp lỗi khi upload ảnh :(',
				'error'
			);
		});
	}

	// Hàm update để cập nhật thông tin người dùng
	$scope.update = function() {
		var item = angular.copy($scope.form); // Tạo bản sao của thông tin người dùng để cập nhật
		var name = document.getElementById("photo").value.split('\\').pop(); // Lấy tên tập tin ảnh từ đường dẫn

		item.photo = name; // Gán tên ảnh mới cho thông tin người dùng
		var url = `http://localhost:8080/restAccount/accounts/${$scope.form.email}`;
		$http.put(url, item).then(resp => {
			Toast.fire({
				icon: 'success',
				title: 'Cập Nhật thành công'
			});
			var index = $scope.items.findIndex(item => item.email == $scope.form.email);
			$scope.items[index] = resp.data; // Cập nhật thông tin người dùng trong danh sách
			$scope.edit(); // Hiển thị thông tin người dùng đã cập nhật
		}).catch(error => {

		});
	}
});