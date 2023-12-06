myapp.controller("ctrlcartDetail", function($scope, $http,$window) {
	$scope.detail = []; 
	$scope.items = []; 
	$scope.itemcart = {}; 
	$scope.price = {}; 

	/* Hàm logout để đăng xuất */
	$scope.logout = function() {
		Swal.fire({
			position: 'top-end',
			title: ' <br>Bạn Muốn Đăng Xuất?<br><br> <a class="btn btn-primary" href="/auth/logoff"> Đăng Xuất</a>',
			showConfirmButton: false,
		})
	}

	/* Hàm viewItems để hiển thị sản phẩm trong giỏ hàng */
	$scope.viewItems = function() {
		var user = $("#usernameCart").text();
		var cartItems = sessionStorage.getItem('cartItems'); 
		if (user) {
			$http.get(`http://localhost:8080/CartItem/cartItems/${user}`).then(resitem => {
				$scope.itemcart = resitem.data; 
				console.log($scope.itemcart);
				$http.get(`http://localhost:8080/CartItem/cartItemDetail/${$scope.itemcart.cartID}`).then(rescartDetail => {
					$scope.detail = rescartDetail.data;

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
				console.error('Error:', error); 
			});
		} else {
			var index = $scope.detail.findIndex(item => item.cartDetailID == cartDetailID);
			if (index !== -1) {
				var product = $scope.detail.splice(index, 1)[0]; 
				var cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
				console.log(user);
				var cartIndex = cartItems.findIndex(item => item.cartDetailID == cartDetailID);
				if (cartIndex !== -1) {
					cartItems.splice(cartIndex, 1); 
				}
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
		const ref = firebase.storage().ref(); 
		const file = document.querySelector('#photo').files[0]; 
		const metadata = {
			contentType: file.type
		};

		const name = file.name; 
		const uploadIMG = ref.child(name).put(file, metadata); 

		uploadIMG
			.then(snapshot => snapshot.ref.getDownloadURL()) 
			.then(url => {
				console.log(url); 
				Swal.fire({
					title: 'Upload thành công',
					text: '',
					imageUrl: url, 
					imageWidth: 400,
					imageHeight: 400,
					imageAlt: 'Custom image',
				});
			})
			.catch(error => {
				Swal.fire(
					'Error',
					'Bạn đã gặp lỗi khi upload ảnh :(',
					'error'
				);
			});
	}
	// Hàm dùng để hiển thị thông tin người dùng hiện tại và chỉnh thông tin người dùng
	$scope.edit = function() {
		var user = $("#useredit").text(); 
		var url = `http://localhost:8080/restAccount/accountss/${user}`;
		$http.get(url).then(resp => {
			$scope.form = resp.data; 
			$scope.names = resp.data.name; 
		}).catch(error => console.log("Error", error));
	}

	// Hàm changepass để đổi mật khẩu
	$scope.changepass = function() {
		var item = angular.copy($scope.form); 
		var pass = $("#oldpass").text(); 

		if (angular.equals($scope.change.password, pass) && angular.equals($scope.change.newpassword, $scope.change.confirmpassword) && $scope.change.newpassword.length >= 6) {
			var url = `http://localhost:8080/restAccount/accounts/${item.email}`;
			item.password = $scope.change.confirmpassword; 
			$http.put(url, item).then(resp => {
				Toast.fire({
					icon: 'success',
					title: 'Cập Nhật thành công'
				});
				var index = $scope.items.findIndex(item => item.email == $scope.form.email);
				$scope.items[index] = resp.data; 
				$scope.edit(); 
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
		data.append('file', files[0]); 
		$http.post(`http://localhost:8080/rest/upload/imageAccount`, data, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined }
		}).then(res => {
			$scope.form.photo = res.data.name; 
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
		var item = angular.copy($scope.form); 
		var name = document.getElementById("photo").value.split('\\').pop(); 
		item.photo = name; 
		var url = `http://localhost:8080/restAccount/accounts/${$scope.form.email}`;
		$http.put(url, item).then(resp => {
			Toast.fire({
				icon: 'success',
				title: 'Cập Nhật thành công'
			});
			var index = $scope.items.findIndex(item => item.email == $scope.form.email);
			$scope.items[index] = resp.data; 
			$scope.edit(); 
		}).catch(error => {

		});
	}
});