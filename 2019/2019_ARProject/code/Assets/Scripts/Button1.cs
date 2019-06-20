using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using LitJson;
using System.IO;

public class Button1 : MonoBehaviour {

	public Button mButton;
	public InputField inputField;//输入框
	public Text contentText;//文本框
	// Use this for initialization
	void Start () {
		Button btn = mButton.GetComponent<Button> ();
		btn.onClick.AddListener (TaskOnClick);
	}
	
	// Update is called once per frame
	void TaskOnClick () {
		 Application.LoadLevel (1);
		
	}
	}

