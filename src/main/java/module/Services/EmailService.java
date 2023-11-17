package module.Services;



public interface EmailService {

	String sendmail(String to, String subject, String body);

}
